"use client";
import { Container, Title } from "@/shared/ui";
import { TopBar } from "@/widgets/topbar";
import { ProductList } from "@/widgets/product-list";
import dynamic from "next/dynamic";
import { SidebarFilterSkeleton } from "@/widgets/sidebar-filter";

const SidebarFilter = dynamic(
  () =>
    import("@/widgets/sidebar-filter").then((mod) => mod.SidebarFilter),
  {
    ssr: false,
    loading: () => <SidebarFilterSkeleton />,
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
