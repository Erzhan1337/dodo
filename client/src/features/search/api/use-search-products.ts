import { useQuery } from "@tanstack/react-query";
import { Product } from "@/entities/product";
import { $api } from "@/shared/api";

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ["products", "query", query],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await $api.get("product/all", {
        params: {
          query,
        },
      });
      return data;
    },
    enabled: !!query,
  });
};
