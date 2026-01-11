import { Container, Title } from "@/shared/ui";
import { TopBar } from "@/widgets/topbar";

export const HomePage = () => {
  return (
    <>
      <Container className="mt-5 md:mt-8 xl:mt-10">
        <Title text="Все Пиццы" className="mb-2 text-2xl lg:text-3xl" />
      </Container>
      <TopBar />
      <div className="h-[2000px] w-full bg-orange-300"></div>
    </>
  );
};
