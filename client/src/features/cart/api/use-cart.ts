import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { $api } from "@/shared/api/instance";
import {
  CartResponse,
  CreateCartItemValues,
} from "@/entities/cart/model/types";

export const useCart = () => {
  return useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await $api.get<CartResponse>("/cart");
      return data;
    },
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

// --- ВОТ ЭТОГО НЕ ХВАТАЛО ---

export const useUpdateItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return $api.patch<CartResponse>("/cart/" + id, { quantity });
    },
    onSuccess: (response) => {
      // Обновляем кеш новыми данными с бэкенда
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
      // Обновляем кеш
      queryClient.setQueryData(["cart"], response.data);
    },
  });
};
