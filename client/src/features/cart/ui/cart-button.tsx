import { Button } from "@/shared/ui";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

export const CartButton = () => {
  return (
    <Link href="/cart" className="group relative">
      <Button className="lg:h-11 lg:py-3 lg:rounded-2xl md:h-9 md:rounded-xl md:py-2 h-7 py-1.5 px-2 relative overflow-hidden">
        <span className="text-xs md:text-base">2500 ₸</span>
        <div className="w-px h-full bg-white/70 mx-1 md:mx-2" />
        <div className="flex items-center gap-1 transition-all duration-500 group-hover:opacity-0">
          <ShoppingCart className="size-3 md:size-4 relative" strokeWidth={2} />
          <span className="font-bold text-xs md:text-base">3</span>
        </div>
        <ArrowRight className="absolute right-5 transition-all duration-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 md:size-5 size-4" />
      </Button>
    </Link>
  );
};
