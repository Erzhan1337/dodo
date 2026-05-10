"use client";
import { Product, ProductCard, useProducts } from "@/entities/product";
import { useQueryParam } from "@/shared/hooks";
import { Pagination, Skeleton } from "@/shared/ui";

export const ProductList = () => {
  const { data: response, isLoading } = useProducts();
  const products = response?.data;
  const meta = response?.meta;
  const { setQueryParam } = useQueryParam("page");

  const onPageChange = (page: number) => {
    setQueryParam(String(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="h-50 md:h-70 bg-[#FFF7EE] flex items-center justify-center rounded-2xl">
                <Skeleton className="w-45 h-45 md:w-54 md:h-54 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md mt-2" />
              <Skeleton className="h-15 w-full rounded-md" />
              <div className="flex items-center justify-between mt-1">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center w-full text-primary text-xl">
        Пиццы не найдены.
      </div>
    );
  }
  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {meta && (
        <div className="flex justify-center mt-15">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
