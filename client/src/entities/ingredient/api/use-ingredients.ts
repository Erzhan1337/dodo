import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";

export const useIngredients = () => {
  return useQuery({
    queryKey: ["Ingredients"],
    queryFn: async () => {
      const { data } = await $api.get("ingredients");
      return data;
    },
  });
};
