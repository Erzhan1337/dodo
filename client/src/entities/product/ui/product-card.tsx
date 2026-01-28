import Image from "next/image";
import { Button } from "@/shared/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/entities/product/model/types";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  return (
    <div className="">
      <div className="h-50 md:h-70 bg-[#FFF7EE] flex items-center justify-center rounded-2xl">
        <div className="relative w-45 h-45 md:w-54 md:h-54 hover:scale-105 transition-transform duration-300">
          <Image src={product.imageUrl} alt={product.name} fill />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-bold text-xl">{product.name}</h3>
        <p className="text-sm text-gray-400 h-15 overflow-y-auto">
          {product.description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-lg">
            от <span className="font-bold">{product.items[0].price} ₸</span>
          </p>
          <Link href={`/product/${product.id}`}>
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-1 px-2 text-primary font-bold rounded-xl shadow-md bg-[#FFFAF4] hover:scale-95 transition-transform duration-300"
            >
              <Plus className="size-4" />
              Добавить
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
