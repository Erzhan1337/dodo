import { useQuery } from "@tanstack/react-query";
import { Product } from "@/entities/product";
import { $api } from "@/shared/api";

export const getProduct = (id: string) => {
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
