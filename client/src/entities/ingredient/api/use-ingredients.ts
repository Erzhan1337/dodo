import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import { Ingredient } from "@/entities/ingredient/model/types";

export const useIngredients = () => {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async (): Promise<Ingredient[]> => {
      const { data } = await $api.get("/ingredients");
      return data;
    },
  });
};
