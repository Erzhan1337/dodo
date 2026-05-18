"use client";
import { Container, Skeleton, Title } from "@/shared/ui";
import { TopBar } from "@/widgets/topbar";
import { ProductList } from "@/widgets/product-list";
import dynamic from "next/dynamic";

const SidebarFilter = dynamic(
  () =>
    import("@/widgets/sidebar-filter").then((mod) => mod.SidebarFilter),
  {
    ssr: false,
    loading: () => (
      <div className="hidden lg:block w-60 shrink-0 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-32 mt-4" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-40" />
        ))}
      </div>
    ),
  },
);

export const HomePage = () => {
  return (
    <main className="my-5 md:my-8 xl:my-10">
      <Container>
        <Title text="Все Пиццы" className="mb-2 text-2xl lg:text-3xl" />
      </Container>
      <TopBar />
      <Container className="flex mt-5 gap-10">
        <SidebarFilter />
        <ProductList />
      </Container>
    </main>
  );
};
