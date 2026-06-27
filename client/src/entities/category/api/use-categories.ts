import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import type { Category } from "@/entities/category/model/types";

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await $api.get("categories");
      return data;
    },
  });
};
