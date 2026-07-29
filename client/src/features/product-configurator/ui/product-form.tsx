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
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ProductRatingSummary } from "@/entities/review";
import { FavoriteButton } from "@/features/favorites";

interface Props {
  product: Product;
  onSubmit?: () => void;
  className?: string;
  rightHeader?: ReactNode;
  rightContent?: ReactNode;
  variant?: "page" | "modal";
}

export const ProductForm = ({
  product,
  onSubmit,
  className,
  rightHeader,
  rightContent,
  variant = "page",
}: Props) => {
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
  const hasRightContent = rightContent !== undefined && rightContent !== null;
  const isModal = variant === "modal";
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
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col lg:flex-row",
        isModal && "overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-t-3xl bg-white py-5 lg:w-[50%] lg:rounded-bl-3xl lg:rounded-tr-none lg:py-0",
          isModal &&
            "shrink-0 py-2 sm:py-3 lg:flex lg:py-0 [@media(max-height:560px)]:hidden",
          isModal && hasRightContent && "hidden lg:flex",
        )}
      >
        <div
          className={cn(
            "relative size-56 sm:size-70 lg:size-85",
            isModal &&
              "size-40 sm:size-48 lg:size-85 [@media(max-height:700px)]:size-36",
          )}
        >
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

      <div
        className={cn(
          "flex min-h-0 w-full flex-col rounded-br-3xl bg-[#F4F1EE] px-4 sm:px-6 lg:w-[50%] lg:rounded-br-3xl lg:rounded-tl-none lg:rounded-tr-3xl lg:px-10",
          rightHeader ? "overflow-hidden py-5" : "py-5",
          isModal && "flex-1 py-3 sm:py-4 lg:py-5",
        )}
      >
        {rightHeader ? (
          <div className={cn("mb-3 shrink-0", isModal && "mb-2 lg:mb-3")}>
            {rightHeader}
          </div>
        ) : null}

        {hasRightContent ? (
          <div className="min-h-0 flex-1 overflow-hidden">{rightContent}</div>
        ) : (
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              isModal && "overflow-hidden",
            )}
          >
            <div
              className={cn(
                isModal &&
                  "min-h-0 flex-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              )}
            >
              <div>
                <div
                  className={cn(
                    "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                    isModal && "flex-row items-start justify-between gap-2",
                  )}
                >
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold sm:text-2xl">
                      {product.name}
                    </h2>
                    <ProductRatingSummary
                      ratingAvg={product.ratingAvg}
                      ratingCount={product.ratingCount}
                      className="mt-1"
                    />
                  </div>
                  <FavoriteButton
                    product={product}
                    productId={product.id}
                    productName={product.name}
                    showLabel={!isModal}
                    className={cn(
                      "shrink-0",
                      isModal ? "size-9 rounded-full" : "w-fit",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "mt-2 text-sm text-gray-600",
                    isModal && "line-clamp-2 text-xs leading-4 sm:text-sm",
                  )}
                >
                  {product.description}
                </p>
              </div>

              {hasProductItems ? (
                <>
                  <div
                    className={cn(
                      "mt-3 flex flex-col gap-3",
                      isModal && "mt-2 gap-2 lg:mt-3 lg:gap-3",
                    )}
                  >
                    <GroupVariants
                      items={PIZZA_SIZES.map((item) => ({
                        name: item.name,
                        value: item.value,
                        disabled: !product.items.some(
                          (pizza) => pizza.size === item.value,
                        ),
                      }))}
                      value={size}
                      compact={isModal}
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
                      compact={isModal}
                      onClick={(val) => setType(val)}
                    />
                  </div>

                  {isLoading ? (
                    <IngredientGridSkeleton compact={isModal} />
                  ) : (
                    <div className={cn("mt-5", isModal && "mt-3 lg:mt-5")}>
                      <p
                        className={cn(
                          "mb-2 text-lg font-semibold",
                          isModal && "text-base lg:text-lg",
                        )}
                      >
                        Добавить по вкусу
                      </p>
                      <div
                        className={cn(
                          "grid h-45 w-full grid-cols-3 gap-2 overflow-y-auto pb-2 md:grid-cols-4 lg:h-78 lg:grid-cols-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                          isModal &&
                            "h-auto overflow-visible md:h-auto lg:h-78 lg:overflow-y-auto",
                        )}
                      >
                        {ingredients.map((ingredient) => (
                          <IngredientCard
                            key={ingredient.id}
                            ingredient={ingredient}
                            onClick={() => toggleIngredient(ingredient.id)}
                            active={selectedIngredients.has(ingredient.id)}
                            compact={isModal}
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
            </div>

            <div
              className={cn(
                isModal &&
                  "shrink-0 border-t border-black/5 bg-[#F4F1EE] pt-3 pb-[env(safe-area-inset-bottom)]",
              )}
            >
              <button
                onClick={handleSubmit}
                disabled={!isAvailable || isPending}
                className={cn(
                  "w-full cursor-pointer rounded-2xl bg-primary py-3 text-lg font-semibold text-white transition-transform duration-300 hover:scale-95",
                  !isModal && (rightHeader ? "mt-auto" : "mt-3 md:mt-5"),
                  (!isAvailable || isPending) &&
                    "cursor-not-allowed opacity-50",
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
        )}
      </div>
    </div>
  );
};
