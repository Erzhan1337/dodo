"use client";
import { Button } from "@/shared/ui";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/api/use-cart";
import { useSessionStore } from "@/entities/session/model/store";

export const CartButton = () => {
  const isAuth = useSessionStore((state) => state.isAuthenticated);
  const href = isAuth ? "/cart" : "/login";
  const { data: cart } = useCart();
  console.log(cart);
  const totalAmount = cart?.totalPrice || 0;
  const itemsCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  return (
    <Link href={href} className="group relative">
      <Button className="lg:h-11 lg:py-3 lg:rounded-2xl md:h-9 md:rounded-xl md:py-2 h-7 py-1.5 px-2 relative overflow-hidden">
        <span className="text-xs md:text-base">{totalAmount} ₸</span>
        <div className="w-px h-full bg-white/70 mx-1 md:mx-2" />
        <div className="flex items-center gap-1 transition-all duration-500 group-hover:opacity-0">
          <ShoppingCart className="size-3 md:size-4 relative" strokeWidth={2} />
          <span className="font-bold text-xs md:text-base">{itemsCount}</span>
        </div>
        <ArrowRight className="absolute right-5 transition-all duration-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 md:size-5 size-4" />
      </Button>
    </Link>
  );
};
