import { useQuery } from "@tanstack/react-query";
import { Product } from "@/entities/product";
import { $api } from "@/shared/api";
import { isAxiosError } from "axios";

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["pizza", id],
    queryFn: async (): Promise<Product> => {
      const { data } = await $api.get(`product/${id}`);
      return data;
    },
    staleTime: 60 * 100 * 5,
    enabled: !!id,
  });
};

export const isProductNotFoundError = (error: unknown) => {
  return isAxiosError(error) && error.response?.status === 404;
};
