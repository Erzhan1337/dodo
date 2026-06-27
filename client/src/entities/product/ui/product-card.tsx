import Image from "next/image";
import { Button } from "@/shared/ui";
import { CircleDivide, Plus } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/entities/product/model/types";
import { formatPrice } from "@/shared/lib/format-price";
import { BLUR_DATA_URL } from "@/shared/lib/blur-data-url";
import { memo } from "react";

interface Props {
  product: Product;
}

export const ProductCard = memo(({ product }: Props) => {
  const minPrice = product.items[0]?.price;
  const isAvailable = minPrice != null;
  const canBuildHalfAndHalf =
    product.canBuildHalfAndHalf &&
    product.items.some((item) => item.size >= 30);
  const halfAndHalfHref = `/pizza-constructor?leftProductId=${product.id}&format=halves`;

  return (
    <div className="">
      <div className="relative flex h-50 items-center justify-center rounded-2xl bg-[#FFF7EE] md:h-70">
        {canBuildHalfAndHalf && (
          <Link
            href={halfAndHalfHref}
            aria-label={`Собрать ${product.name} с другой половинкой`}
            className="group/half absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-full bg-white text-primary shadow-md transition-transform hover:scale-95"
          >
            <CircleDivide className="size-5" />
            <span className="pointer-events-none absolute right-0 top-12 hidden w-max rounded-xl bg-gray-950 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover/half:block">
              Собрать микс
            </span>
          </Link>
        )}
        <div className="relative w-45 h-45 md:w-54 md:h-54 hover:scale-105 transition-transform duration-300">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 180px, 216px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-xl">{product.name}</h3>
        <p className="text-sm text-gray-400 h-15 overflow-y-auto">
          {product.description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-lg">
            {isAvailable ? (
              <>
                от <span className="font-bold">{formatPrice(minPrice)}</span>
              </>
            ) : (
              <span className="font-bold text-gray-400">Нет в наличии</span>
            )}
          </p>
          {isAvailable ? (
            <Link href={`/product/${product.id}`} scroll={false}>
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-1 px-2 text-primary font-bold rounded-xl shadow-md bg-[#FFFAF4] hover:scale-95 transition-transform duration-300"
              >
                <Plus className="size-4" />
                Добавить
              </Button>
            </Link>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled
              className="flex items-center gap-1 px-2 text-primary font-bold rounded-xl shadow-md bg-[#FFFAF4] hover:scale-95 transition-transform duration-300"
            >
              Нет в наличии
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";
