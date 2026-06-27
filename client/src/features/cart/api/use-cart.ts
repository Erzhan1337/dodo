import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { $api } from "@/shared/api/instance";
import {
  CartResponse,
  CreateCartItemValues,
} from "@/entities/cart/model/types";
import { useSessionStore } from "@/entities/session/model/store";
import { getCartQueryKey } from "@/entities/cart/model/query-key";

const getCurrentUserId = () => useSessionStore.getState().user?.id ?? null;

const setCurrentUserCartQueryData = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | null,
  cart: CartResponse,
) => {
  if (getCurrentUserId() !== userId) return;

  queryClient.setQueryData(getCartQueryKey(userId), cart);
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
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const userId = getCurrentUserId();
      const { data } = await $api.patch<CartResponse>("/cart/" + id, {
        quantity,
      });
      return { cart: data, userId };
    },
    onSuccess: ({ cart, userId }) => {
      setCurrentUserCartQueryData(queryClient, userId, cart);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = getCurrentUserId();
      const { data } = await $api.delete<CartResponse>("/cart/" + id);
      return { cart: data, userId };
    },
    onSuccess: ({ cart, userId }) => {
      setCurrentUserCartQueryData(queryClient, userId, cart);
    },
  });
};

export const useRemoveCartItemIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
    onSuccess: ({ cart, userId }) => {
      setCurrentUserCartQueryData(queryClient, userId, cart);
    },
  });
};
