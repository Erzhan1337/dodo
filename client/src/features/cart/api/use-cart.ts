import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { $api } from "@/shared/api/instance";
import {
  CartResponse,
  CreateCartItemValues,
} from "@/entities/cart/model/types";
import { useSessionStore } from "@/entities/session/model/store";

const CART_QUERY_KEY = ["cart"] as const;
const ANONYMOUS_CART_QUERY_KEY = "anonymous";

const getCartQueryKey = (userId: string | null | undefined) => [
  ...CART_QUERY_KEY,
  userId ?? ANONYMOUS_CART_QUERY_KEY,
];

const getCurrentUserId = () => useSessionStore.getState().user?.id ?? null;

const setCurrentUserCartQueryData = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | null,
  cart: CartResponse,
) => {
  if (!userId || getCurrentUserId() !== userId) return;

  queryClient.setQueryData(getCartQueryKey(userId), cart);
};

export const useCart = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const userId = useSessionStore((state) => state.user?.id);

  return useQuery<CartResponse>({
    queryKey: getCartQueryKey(userId),
    queryFn: async () => {
      const { data } = await $api.get<CartResponse>("/cart");
      return data;
    },
    enabled: isAuthenticated && Boolean(userId),
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
