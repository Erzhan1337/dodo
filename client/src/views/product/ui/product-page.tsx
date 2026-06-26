"use client";
import Link from "next/link";
import { isProductNotFoundError, useProduct } from "@/entities/product";
import { Breadcrumbs, Container, Skeleton } from "@/shared/ui";
import { ProductForm } from "@/features/product-configurator/ui/product-form";

interface Props {
  id: string;
}

export const ProductPage = ({ id }: Props) => {
  const { data: product, error, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <Container className="mt-10">
        <div className="w-full h-115 flex">
          <div className="w-[50%]">
            <Skeleton className="rounded-3xl h-full" />
          </div>
          <div className="w-[50%] px-10">
            <div className="w-70 h-9">
              <Skeleton className="rounded-xl h-full" />
            </div>
            <div className="w-90 flex flex-col gap-5 mt-10">
              <Skeleton className="rounded-xl h-11" />
              <Skeleton className="rounded-xl h-11" />
            </div>
            <div className="flex gap-2 mt-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-30 h-40 rounded-xl" />
              ))}
            </div>
            <Skeleton className="rounded-xl h-13 w-60 mt-8" />
          </div>
        </div>
        <div className="flex gap-5 mt-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-90 w-80 rounded-2xl" />
          ))}
        </div>
      </Container>
    );
  }

  if (isError || !product) {
    const isNotFound = isError ? isProductNotFoundError(error) : !product;

    return (
      <Container className="my-10 flex min-h-100 flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-extrabold">
          {isNotFound ? "Продукт не найден" : "Не удалось загрузить продукт"}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {isNotFound
            ? "Возможно, он был удалён или ссылка устарела."
            : "Попробуйте обновить страницу или вернуться к меню."}
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Вернуться к меню
        </Link>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col my-10">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: product.name },
        ]}
        className="mb-5"
      />
      <ProductForm product={product} />
    </Container>
  );
};
