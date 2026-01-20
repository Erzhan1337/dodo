import { Container, Title } from "@/shared/ui";
import { TopBar } from "@/widgets/topbar";
import { SidebarFilter } from "@/widgets/sidebar-filter";
import { ProductList } from "@/widgets/product-list";

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
