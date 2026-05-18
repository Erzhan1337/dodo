"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import { Product } from "@/entities/product/model/types";
import { useMemo } from "react";

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

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const ingredients = searchParams.get("ing");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  const params = useMemo(
    () => ({ from, to, ingredients, category, sort, page, limit }),
    [from, to, ingredients, category, sort, page, limit],
  );

  return useQuery({
    queryKey: ["pizzas", params],
    queryFn: async (): Promise<Response> => {
      const { data } = await $api.get("/product/all", { params });
      return data;
    },
  });
};
