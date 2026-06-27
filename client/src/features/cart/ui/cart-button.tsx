"use client";
import { Button } from "@/shared/ui";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/api/use-cart";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";

export const CartButton = () => {
  const { data: cart } = useCart();
  const isCartLoading = !cart;
  const totalAmount = cart?.totalPrice || 0;
  const itemsCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Link href="/cart" className="group relative">
      <Button
        aria-busy={isCartLoading}
        className={cn(
          "lg:h-11 lg:py-3 lg:rounded-2xl md:h-9 md:rounded-xl md:py-2 h-7 py-1.5 px-2 relative overflow-hidden",
          isCartLoading &&
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.45s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent",
        )}
      >
        <span className="relative z-10 flex items-center justify-center text-xs md:text-base">
          {isCartLoading ? (
            <span aria-hidden="true" className="flex items-center gap-1">
              <span className="h-2 w-8 rounded-full bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] md:h-2.5 md:w-11" />
              <span className="h-2 w-3 rounded-full bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] md:h-2.5 md:w-4" />
            </span>
          ) : (
            formatPrice(totalAmount)
          )}
        </span>
        <div className="relative z-10 w-px h-full bg-white/70 mx-1 md:mx-2" />
        <div
          className={cn(
            "relative z-10 flex items-center justify-center gap-1 transition-all duration-500",
            !isCartLoading && "group-hover:opacity-0",
          )}
        >
          <ShoppingCart
            className={cn(
              "size-3 md:size-4 relative",
              isCartLoading && "animate-pulse opacity-90",
            )}
            strokeWidth={2}
          />
          {isCartLoading ? (
            <span
              aria-hidden="true"
              className="block h-2.5 w-3 rounded-full bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] md:h-3 md:w-4"
            />
          ) : (
            <span className="font-bold text-xs md:text-base">{itemsCount}</span>
          )}
        </div>
        {!isCartLoading && (
          <ArrowRight className="absolute right-5 z-10 transition-all duration-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 md:size-5 size-4" />
        )}
      </Button>
    </Link>
  );
};
