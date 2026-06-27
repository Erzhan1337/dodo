import { Breadcrumbs, Button, Container, Skeleton } from "@/shared/ui";

export const CartPageSkeleton = () => {
  return (
    <Container className="mt-10 pb-20">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]}
        className="mb-5"
      />
      <Skeleton className="mb-10 h-9 w-32" />
      <div className="flex gap-10">
        <div className="flex flex-1 flex-col gap-5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="hidden md:w-110 lg:block">
          <div className="sticky top-10 rounded-[30px] bg-white p-8 shadow-lg">
            <Skeleton className="mb-2 h-6 w-20" />
            <Skeleton className="h-10 w-36" />
            <div className="my-5 border-b border-gray-100" />
            <Button className="h-14 w-full text-base font-bold" disabled>
              Оформить заказ
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};
