"use client";
import { Product, ProductCard, useProducts } from "@/entities/product";
import { useQueryParam } from "@/shared/hooks";
import { Pagination, QueryErrorState, Skeleton } from "@/shared/ui";
import { LazyMotion, m } from "framer-motion";
import { loadMotionFeatures } from "@/shared/lib/motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const ProductList = () => {
  const { data: response, isError, isFetching, isLoading, refetch } =
    useProducts();
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
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div key={id} className="flex flex-col gap-4">
              <div className="h-44 md:h-70 bg-[#FFF7EE] flex items-center justify-center rounded-2xl">
                <Skeleton className="w-36 h-36 md:w-54 md:h-54 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md mt-2" />
              <Skeleton className="h-12 md:h-15 w-full rounded-md" />
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

  if (isError) {
    return (
      <QueryErrorState
        className="flex-1"
        title="Не удалось загрузить пиццы"
        description="Проверьте подключение к серверу или попробуйте обновить список."
        actionLabel={isFetching ? "Загрузка..." : "Повторить"}
        actionDisabled={isFetching}
        onAction={() => void refetch()}
      />
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
      <LazyMotion features={loadMotionFeatures}>
        <m.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.07 }}
        >
          {products.map((product: Product) => (
            <m.div
              key={product.id}
              variants={itemVariants}
              transition={{ duration: 0.35 }}
            >
              <ProductCard product={product} />
            </m.div>
          ))}
        </m.div>
      </LazyMotion>
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
