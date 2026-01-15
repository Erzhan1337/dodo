import { Container, Title } from "@/shared/ui";
import { TopBar } from "@/widgets/topbar";
import { SidebarFilter } from "@/widgets/sidebar-filter";

export const HomePage = () => {
  return (
    <>
      <Container className="mt-5 md:mt-8 xl:mt-10">
        <Title text="Все Пиццы" className="mb-2 text-2xl lg:text-3xl" />
      </Container>
      <TopBar />
      <Container>
        <SidebarFilter />
      </Container>
    </>
  );
};
