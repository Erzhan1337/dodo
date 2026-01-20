"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import { Product } from "@/entities/product/model/types";

export const useProducts = () => {
  const searchParams = useSearchParams();

  const params = {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    ingredients: searchParams.get("ing"),
    category: searchParams.get("category"),
    sort: searchParams.get("sort"),
  };

  return useQuery({
    queryKey: ["pizzas", params],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await $api.get("/product/all", { params });
      return data;
    },
  });
};
