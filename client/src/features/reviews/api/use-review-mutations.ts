"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getOrdersQueryKey, ORDERS_QUERY_KEY } from "@/entities/order/api/use-orders";
import { useSessionStore } from "@/entities/session/model/store";
import {
  reviewKeys,
  type ProductReview,
  type ProductReviewFormValues,
  type UpdateProductReviewValues,
} from "@/entities/review";
import { $api } from "@/shared/api";

const invalidateReviewDependencies = (
  queryClient: ReturnType<typeof useQueryClient>,
  productId?: string,
) => {
  const userId = useSessionStore.getState().user?.id;

  void queryClient.invalidateQueries({ queryKey: getOrdersQueryKey(userId) });
  void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ["pizzas"] });

  if (productId) {
    void queryClient.invalidateQueries({
      queryKey: [...reviewKeys.root, "product", productId],
    });
  }
};

export const useCreateProductReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProductReviewFormValues) => {
      const { data } = await $api.post<ProductReview>("/reviews", payload);
      return data;
    },
    onSuccess: (review) => {
      toast.success("Оценка сохранена");
      invalidateReviewDependencies(queryClient, review.productId);
    },
  });
};

export const useUpdateProductReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductReviewValues;
    }) => {
      const { data } = await $api.patch<ProductReview>(`/reviews/${id}`, payload);
      return data;
    },
    onSuccess: (review) => {
      toast.success("Оценка обновлена");
      invalidateReviewDependencies(queryClient, review.productId);
    },
  });
};

export const useDeleteProductReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await $api.delete(`/reviews/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Оценка удалена");
      invalidateReviewDependencies(queryClient);
    },
  });
};
