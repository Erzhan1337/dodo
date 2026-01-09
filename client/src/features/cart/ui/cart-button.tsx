import { Button } from "@/shared/ui";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

export const CartButton = () => {
  return (
    <Link href="/cart" className="group relative">
      <Button
        variant="default"
        size="lg"
        className="py-3 relative overflow-hidden"
      >
        <span>2500 ₸</span>
        <div className="w-px h-full bg-white/70 mx-2" />
        <div className="flex items-center gap-1 transition-all duration-500 group-hover:opacity-0">
          <ShoppingCart className="size-4 relative" strokeWidth={2} />
          <span className="font-bold">3</span>
        </div>
        <ArrowRight className="absolute right-5 transition-all duration-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
      </Button>
    </Link>
  );
};
