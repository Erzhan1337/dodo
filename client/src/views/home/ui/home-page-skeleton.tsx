import { Container, Title } from "@/shared/ui";
import { ProductListSkeleton } from "@/widgets/product-list";
import { SidebarFilterSkeleton } from "@/widgets/sidebar-filter";
import { TopBarSkeleton } from "@/widgets/topbar";

export const HomePageSkeleton = () => {
  return (
    <main className="my-5 md:my-8 xl:my-10">
      <Container>
        <Title text="Все Пиццы" className="mb-2 text-2xl lg:text-3xl" />
      </Container>
      <TopBarSkeleton />
      <Container className="mt-5 flex min-w-0 gap-10">
        <SidebarFilterSkeleton />
        <ProductListSkeleton />
      </Container>
    </main>
  );
};
