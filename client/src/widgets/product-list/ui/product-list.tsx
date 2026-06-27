"use client";
import { Product, ProductCard, useProducts } from "@/entities/product";
import { useQueryParam } from "@/shared/hooks";
import { Pagination, QueryErrorState } from "@/shared/ui";
import { domAnimation, LazyMotion, m, type Variants } from "framer-motion";
import { ProductListSkeleton } from "@/widgets/product-list/ui/product-list-skeleton";
import { useEffect, useState } from "react";

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

export const ProductList = () => {
  const { data: response, isError, isFetching, isLoading, refetch } =
    useProducts();
  const products = response?.data;
  const meta = response?.meta;
  const { setQueryParam } = useQueryParam("page");

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const onPageChange = (page: number) => {
    setQueryParam(String(page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return <ProductListSkeleton />;
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

  const productsAnimationKey = products.map((product) => product.id).join("-");

  return (
    <div className="flex-1">
      <LazyMotion features={domAnimation}>
        <m.div
          key={productsAnimationKey}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={listVariants}
          initial={hasMounted ? "hidden" : false}
          animate="visible"
        >
          {products.map((product: Product) => (
            <m.div key={product.id} variants={itemVariants}>
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
