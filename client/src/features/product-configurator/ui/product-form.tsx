"use client";
import { useProductForm } from "@/features/product-configurator/model/use-product-form";
import { Product } from "@/entities/product";
import { cn } from "@/shared/lib/utils";
import NextImage from "next/image";
import { GroupVariants } from "@/features/product-configurator/ui/group-variants";
import {
  PIZZA_SIZES,
  PIZZA_TYPES,
} from "@/features/product-configurator/model/constants";
import { IngredientCard, useIngredients } from "@/entities/ingredient";
import { useAddToCart } from "@/features/cart/api/use-cart";
import toast from "react-hot-toast";
import { formatPrice } from "@/shared/lib/format-price";
import { BLUR_DATA_URL } from "@/shared/lib/blur-data-url";
import { IngredientGridSkeleton } from "@/features/product-configurator/ui/ingredient-grid-skeleton";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  product: Product;
  onSubmit?: () => void;
  className?: string;
}

export const ProductForm = ({ product, onSubmit, className }: Props) => {
  const { data: ingredients = [], isLoading } = useIngredients();
  const hasProductItems = product.items.length > 0;
  const {
    size,
    type,
    selectedIngredients,
    setSize,
    setType,
    toggleIngredient,
    isAvailable,
    currentImage,
    totalPrice,
    currentItemId,
  } = useProductForm(product, ingredients);

  const { mutate: addToCart, isPending } = useAddToCart();

  const { total } = totalPrice();
  const [loadedImage, setLoadedImage] = useState(currentImage);
  const isImageLoading = loadedImage !== currentImage;
  const productImageUrls = useMemo(
    () =>
      Array.from(
        new Set(
          [product.imageUrl, ...product.items.map((item) => item.imageUrl)].filter(
            Boolean,
          ),
        ),
      ),
    [product.imageUrl, product.items],
  );

  useEffect(() => {
    productImageUrls.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, [productImageUrls]);

  const handleSubmit = () => {
    if (!hasProductItems) return;

    if (!currentItemId) return;

    addToCart(
      {
        productItemId: currentItemId,
        ingredients: Array.from(selectedIngredients) as string[],
      },
      {
        onSuccess: () => {
          toast.success(`${product.name} добавлена в корзину!`);
          onSubmit?.();
        },
      },
    );
  };

  return (
    <div className={cn("flex flex-1 flex-col lg:flex-row", className)}>
      <div className="flex w-full items-center justify-center rounded-t-3xl bg-white py-5 lg:w-[50%] lg:rounded-bl-3xl lg:rounded-tr-none lg:py-0">
        <div className="relative size-56 sm:size-70 lg:size-85">
          <NextImage
            src={currentImage}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 280px, 340px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            onLoad={() => setLoadedImage(currentImage)}
            onError={() => setLoadedImage(currentImage)}
            className={cn(
              "object-contain transition-[filter,opacity,transform] duration-300",
              isImageLoading && "scale-[0.98] opacity-75 blur-[2px]",
            )}
          />
          {isImageLoading && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white/55 backdrop-blur-[2px] before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.2s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-primary/15 before:to-transparent">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg shadow-orange-200/60 ring-1 ring-primary/10">
                  <Loader2 className="size-7 animate-spin text-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full rounded-b-3xl bg-[#F4F1EE] px-4 py-5 sm:px-6 lg:w-[50%] lg:rounded-br-3xl lg:rounded-tl-none lg:rounded-tr-3xl lg:px-10">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">{product.name}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {product.description}
          </p>
        </div>
        {hasProductItems ? (
          <>
            <div className="flex flex-col gap-3 mt-3">
              <GroupVariants
                items={PIZZA_SIZES.map((item) => ({
                  name: item.name,
                  value: item.value,
                  disabled: !product.items.some(
                    (pizza) => pizza.size === item.value,
                  ),
                }))}
                value={size}
                onClick={(val) => setSize(val)}
              />
              <GroupVariants
                items={PIZZA_TYPES.map((item) => ({
                  name: item.name,
                  value: item.value,
                  disabled: !product.items.some(
                    (pizza) =>
                      pizza.size === size && pizza.pizzaType === item.value,
                  ),
                }))}
                value={type}
                onClick={(val) => setType(val)}
              />
            </div>

            {isLoading ? (
              <IngredientGridSkeleton />
            ) : (
              <div className="mt-5">
                <p className="text-lg font-semibold mb-2">Добавить по вкусу</p>
                <div className="pb-2 w-full overflow-y-auto h-45 lg:h-90 gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {ingredients.map((ingredient) => (
                    <IngredientCard
                      key={ingredient.id}
                      ingredient={ingredient}
                      onClick={() => toggleIngredient(ingredient.id)}
                      active={selectedIngredients.has(ingredient.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-2xl bg-white p-5 text-center text-muted-foreground">
            Этот продукт сейчас недоступен для заказа.
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isAvailable || isPending}
          className={cn(
            "font-semibold w-full mt-3 md:mt-5 bg-primary py-3 cursor-pointer rounded-2xl text-white text-lg hover:scale-95 transition-transform duration-300",
            (!isAvailable || isPending) && "opacity-50 cursor-not-allowed",
          )}
        >
          {!hasProductItems
            ? "Нет в наличии"
            : isPending
              ? "Добавляем..."
              : `Добавить в корзину за ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
};
