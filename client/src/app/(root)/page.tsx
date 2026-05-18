import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "@/shared/lib/get-query-client";
import {
  fetchProducts,
  buildProductParams,
} from "@/entities/product/api/fetch-products";
import { HomePage } from "@/views/home";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const queryClient = getQueryClient();
  const params = buildProductParams(sp);

  await queryClient.prefetchQuery({
    queryKey: ["pizzas", params],
    queryFn: () => fetchProducts(params),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div />}>
        <HomePage />
      </Suspense>
    </HydrationBoundary>
  );
}
