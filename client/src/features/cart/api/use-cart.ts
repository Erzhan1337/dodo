import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { $api } from "@/shared/api/instance";
import {
  CartResponse,
  CreateCartItemValues,
} from "@/entities/cart/model/types";
import { useSessionStore } from "@/entities/session/model/store";

export const useCart = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  return useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await $api.get<CartResponse>("/cart");
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCartItemValues) => {
      return $api.post<CartResponse>("/cart", values);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data);
    },
  });
};

export const useUpdateItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return $api.patch<CartResponse>("/cart/" + id, { quantity });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return $api.delete<CartResponse>("/cart/" + id);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.data);
    },
  });
};
