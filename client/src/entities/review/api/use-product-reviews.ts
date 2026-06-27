"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import type { PaginatedReviews } from "@/entities/review/model/types";

export const reviewKeys = {
  root: ["reviews"] as const,
  product: (productId: string, page: number) =>
    [...reviewKeys.root, "product", productId, page] as const,
};

export const useProductReviews = (productId: string, page: number) => {
  return useQuery({
    queryKey: reviewKeys.product(productId, page),
    queryFn: async ({ signal }): Promise<PaginatedReviews> => {
      const { data } = await $api.get(`/reviews/product/${productId}`, {
        params: { page, limit: 5 },
        signal,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};
