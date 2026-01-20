"use client";
import { Product, ProductCard, useProducts } from "@/entities/product";

export const ProductList = () => {
  const { data: products, isLoading } = useProducts();
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full text-primary">
        Загружаем пиццы...
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
    </div>
  );
};
