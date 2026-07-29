import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { $api } from "@/shared/api/instance";
import {
  CartResponse,
  CreateCartItemValues,
  PromoCodeOffer,
} from "@/entities/cart/model/types";
import { useSessionStore } from "@/entities/session/model/store";
import { getCartQueryKey } from "@/entities/cart/model/query-key";
import { handleApiError } from "@/shared/lib/handle-api-error";

const getCurrentUserId = () => useSessionStore.getState().user?.id ?? null;
const PROMO_CODES_QUERY_KEY = ["promo-codes"] as const;
const CART_ITEM_MUTATION_KEY = ["cart-item-mutation"] as const;
const CART_ITEM_MUTATION_SCOPE = { id: "cart-item-mutation" } as const;

const setCurrentUserCartQueryData = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | null,
  cart: CartResponse,
) => {
  if (getCurrentUserId() !== userId) return;

  queryClient.setQueryData(getCartQueryKey(userId), cart);
};

const updateCurrentCartOptimistically = async (
  queryClient: ReturnType<typeof useQueryClient>,
  updateCart: (cart: CartResponse) => CartResponse,
) => {
  const userId = getCurrentUserId();
  const queryKey = getCartQueryKey(userId);

  await queryClient.cancelQueries({ queryKey });

  const previousCart = queryClient.getQueryData<CartResponse>(queryKey);

  if (previousCart && getCurrentUserId() === userId) {
    queryClient.setQueryData(queryKey, updateCart(previousCart));
  }

  return { previousCart, queryKey, userId };
};

const isLatestCartItemMutation = (
  queryClient: ReturnType<typeof useQueryClient>,
) =>
  queryClient.isMutating({ mutationKey: CART_ITEM_MUTATION_KEY }) === 1;

const calculateCartSubtotal = (items: CartResponse["items"]) =>
  items.reduce((subtotal, item) => {
    const ingredientsPrice = item.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.price,
      0,
    );
    const unitPrice =
      item.customUnitPrice ?? item.productItem.price + ingredientsPrice;

    return subtotal + unitPrice * item.quantity;
  }, 0);

const calculatePromoDiscount = (
  cart: CartResponse,
  subtotalPrice: number,
) => {
  const promoCode = cart.promoCode;

  if (
    !promoCode ||
    subtotalPrice <= 0 ||
    subtotalPrice < promoCode.minOrderAmount
  ) {
    return { discountAmount: 0, promoCode: null };
  }

  const rawDiscount =
    promoCode.type === "PERCENT"
      ? Math.floor((subtotalPrice * promoCode.value) / 100)
      : promoCode.value;
  const cappedDiscount =
    promoCode.maxDiscountAmount == null
      ? rawDiscount
      : Math.min(rawDiscount, promoCode.maxDiscountAmount);

  return {
    discountAmount: Math.max(
      0,
      Math.min(cappedDiscount, subtotalPrice),
    ),
    promoCode,
  };
};

const updateCartPricing = (
  cart: CartResponse,
  items: CartResponse["items"],
) => {
  const subtotalPrice = calculateCartSubtotal(items);
  const { discountAmount, promoCode } = calculatePromoDiscount(
    cart,
    subtotalPrice,
  );
  const totalPrice = Math.max(subtotalPrice - discountAmount, 0);

  return {
    ...cart,
    items,
    subtotalPrice,
    discountAmount,
    totalPrice,
    totalAmount: totalPrice,
    promoCodeId: promoCode?.id ?? null,
    promoCode,
  };
};

const updateCartItemQuantityOptimistically = (
  cart: CartResponse,
  itemId: string,
  quantity: number,
) => {
  if (
    quantity < 1 ||
    !cart.items.some((cartItem) => cartItem.id === itemId)
  ) {
    return cart;
  }

  return updateCartPricing(
    cart,
    cart.items.map((cartItem) =>
      cartItem.id === itemId ? { ...cartItem, quantity } : cartItem,
    ),
  );
};

const removeCartItemOptimistically = (
  cart: CartResponse,
  itemId: string,
) => {
  if (!cart.items.some((cartItem) => cartItem.id === itemId)) {
    return cart;
  }

  return updateCartPricing(
    cart,
    cart.items.filter((cartItem) => cartItem.id !== itemId),
  );
};

const removeCartItemIngredientOptimistically = (
  cart: CartResponse,
  itemId: string,
  ingredientId: string,
) => {
  const item = cart.items.find((cartItem) => cartItem.id === itemId);
  const hasIngredient = item?.ingredients.some(
    (ingredient) => ingredient.id === ingredientId,
  );

  if (!item || !hasIngredient || item.customUnitPrice != null) {
    return cart;
  }

  const ingredients = item.ingredients.filter(
    (ingredient) => ingredient.id !== ingredientId,
  );
  const ingredientsKey = ingredients
    .map((ingredient) => ingredient.id)
    .sort()
    .join(",");
  const matchingItem = cart.items.find(
    (cartItem) =>
      cartItem.id !== itemId &&
      cartItem.customUnitPrice == null &&
      cartItem.productItem.id === item.productItem.id &&
      cartItem.ingredients
        .map((ingredient) => ingredient.id)
        .sort()
        .join(",") === ingredientsKey,
  );
  const items = matchingItem
    ? cart.items.flatMap((cartItem) => {
        if (cartItem.id === itemId) return [];
        if (cartItem.id === matchingItem.id) {
          return [
            {
              ...cartItem,
              quantity: cartItem.quantity + item.quantity,
            },
          ];
        }

        return [cartItem];
      })
    : cart.items.map((cartItem) =>
        cartItem.id === itemId ? { ...cartItem, ingredients } : cartItem,
      );
  return updateCartPricing(cart, items);
};

export const useCart = () => {
  const userId = useSessionStore((state) => state.user?.id);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const canFetchCart =
    _hasHydrated && (!isAuthenticated || Boolean(accessToken));

  return useQuery<CartResponse>({
    queryKey: getCartQueryKey(userId),
    queryFn: async () => {
      const { data } = await $api.get<CartResponse>("/cart");
      return data;
    },
    enabled: canFetchCart,
  });
};

export const usePromoCodes = () => {
  return useQuery<PromoCodeOffer[]>({
    queryKey: PROMO_CODES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await $api.get<PromoCodeOffer[]>("/promo-codes");
      return data;
    },
    staleTime: 60_000,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCartItemValues) => {
      const userId = getCurrentUserId();
      const { data } = await $api.post<CartResponse>("/cart", values);
      return { cart: data, userId };
    },
    onSuccess: ({ cart, userId }) => {
      setCurrentUserCartQueryData(queryClient, userId, cart);
    },
  });
};

export const useUpdateItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CART_ITEM_MUTATION_KEY,
    scope: CART_ITEM_MUTATION_SCOPE,
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const userId = getCurrentUserId();
      const { data } = await $api.patch<CartResponse>("/cart/" + id, {
        quantity,
      });
      return { cart: data, userId };
    },
    onMutate: ({ id, quantity }) =>
      updateCurrentCartOptimistically(queryClient, (cart) =>
        updateCartItemQuantityOptimistically(cart, id, quantity),
      ),
    onError: (error, _variables, context) => {
      if (
        isLatestCartItemMutation(queryClient) &&
        context?.previousCart &&
        getCurrentUserId() === context.userId
      ) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }

      handleApiError(error);
    },
    onSuccess: ({ cart, userId }) => {
      if (isLatestCartItemMutation(queryClient)) {
        setCurrentUserCartQueryData(queryClient, userId, cart);
      }
    },
    onSettled: (_data, error, _variables, context) => {
      if (
        error &&
        isLatestCartItemMutation(queryClient) &&
        context &&
        getCurrentUserId() === context.userId
      ) {
        return queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CART_ITEM_MUTATION_KEY,
    scope: CART_ITEM_MUTATION_SCOPE,
    mutationFn: async (id: string) => {
      const userId = getCurrentUserId();
      const { data } = await $api.delete<CartResponse>("/cart/" + id);
      return { cart: data, userId };
    },
    onMutate: (id) =>
      updateCurrentCartOptimistically(queryClient, (cart) =>
        removeCartItemOptimistically(cart, id),
      ),
    onError: (error, _variables, context) => {
      if (
        isLatestCartItemMutation(queryClient) &&
        context?.previousCart &&
        getCurrentUserId() === context.userId
      ) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }

      handleApiError(error);
    },
    onSuccess: ({ cart, userId }) => {
      if (isLatestCartItemMutation(queryClient)) {
        setCurrentUserCartQueryData(queryClient, userId, cart);
      }
    },
    onSettled: (_data, error, _variables, context) => {
      if (
        error &&
        isLatestCartItemMutation(queryClient) &&
        context &&
        getCurrentUserId() === context.userId
      ) {
        return queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
};

export const useRemoveCartItemIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CART_ITEM_MUTATION_KEY,
    scope: CART_ITEM_MUTATION_SCOPE,
    mutationFn: async ({
      itemId,
      ingredientId,
    }: {
      itemId: string;
      ingredientId: string;
    }) => {
      const userId = getCurrentUserId();
      const { data } = await $api.delete<CartResponse>(
        `/cart/${itemId}/ingredients/${ingredientId}`,
      );
      return { cart: data, userId };
    },
    onMutate: ({ itemId, ingredientId }) =>
      updateCurrentCartOptimistically(queryClient, (cart) =>
        removeCartItemIngredientOptimistically(cart, itemId, ingredientId),
      ),
    onError: (error, _variables, context) => {
      if (
        isLatestCartItemMutation(queryClient) &&
        context?.previousCart &&
        getCurrentUserId() === context.userId
      ) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }

      handleApiError(error);
    },
    onSuccess: ({ cart, userId }) => {
      if (isLatestCartItemMutation(queryClient)) {
        setCurrentUserCartQueryData(queryClient, userId, cart);
      }
    },
    onSettled: (_data, error, _variables, context) => {
      if (
        error &&
        isLatestCartItemMutation(queryClient) &&
        context &&
        getCurrentUserId() === context.userId
      ) {
        return queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
};

export const useApplyPromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const userId = getCurrentUserId();
      const { data } = await $api.post<CartResponse>("/cart/promo-code", {
        code,
      });
      return { cart: data, userId };
    },
    onSuccess: ({ cart, userId }) => {
      setCurrentUserCartQueryData(queryClient, userId, cart);
    },
  });
};

export const useRemovePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const userId = getCurrentUserId();
      const { data } = await $api.delete<CartResponse>("/cart/promo-code");
      return { cart: data, userId };
    },
    onSuccess: ({ cart, userId }) => {
      setCurrentUserCartQueryData(queryClient, userId, cart);
    },
  });
};
