"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import { Product } from "@/entities/product/model/types";

interface Response {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useProducts = () => {
  const searchParams = useSearchParams();

  const params = {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    ingredients: searchParams.get("ing"),
    category: searchParams.get("category"),
    sort: searchParams.get("sort"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  };

  return useQuery({
    queryKey: ["pizzas", params],
    queryFn: async (): Promise<Response> => {
      const { data } = await $api.get("/product/all", { params });
      return data;
    },
  });
};
