import { Container, Title } from "@/shared/ui";
import { TopBar } from "@/widgets/topbar";
import { ProductList } from "@/widgets/product-list";
import { SidebarFilterDynamic } from "@/widgets/sidebar-filter";

export const HomePage = () => {
  return (
    <main className="my-5 md:my-8 xl:my-10">
      <Container>
        <Title text="Все Пиццы" className="text-2xl lg:text-3xl" />
      </Container>
      <TopBar />
      <Container className="flex mt-5 gap-10">
        <SidebarFilterDynamic />
        <ProductList />
      </Container>
    </main>
  );
};
