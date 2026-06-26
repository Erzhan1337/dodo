import { useQuery } from "@tanstack/react-query";
import { Product } from "@/entities/product";
import { $api } from "@/shared/api";

export const useSearchProducts = (query: string) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["products", "query", normalizedQuery],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await $api.get("product/all", {
        params: {
          query: normalizedQuery,
        },
      });
      return data.data;
    },
    enabled: normalizedQuery.length > 0,
  });
};
