"use client";
import { getProduct } from "@/entities/product";
import { Container, Skeleton } from "@/shared/ui";
import { ProductForm } from "@/features/product-configurator/ui/product-form";

interface Props {
  id: string;
}

export const ProductPage = ({ id }: Props) => {
  const { data: product, isLoading, isError } = getProduct(id);

  if (!product || isError) {
    return <div>Not found</div>
  }

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
  return (
    <Container className="flex flex-col my-10">
      <ProductForm product={product} onSubmit={() => console.log("success")} />
    </Container>
  );
};
