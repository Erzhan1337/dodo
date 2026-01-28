import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import { CartItem as CartItemType } from "@/entities/cart/model/types";
import { Button } from "@/shared/ui/button";
import { Title } from "@/shared/ui/title";
import Image from "next/image";

interface Props {
  item: CartItemType;
  className?: string;
  onClickCountButton?: (id: string, quantity: number) => void;
  onClickRemove?: (id: string) => void;
}

export const CartItem: React.FC<Props> = ({
  item,
  className,
  onClickCountButton,
  onClickRemove,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-10 h-10 md:w-15 md:h-15">
          <Image
            src={item.productItem.product.imageUrl}
            alt={item.productItem.product.name}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h4>{item.productItem.product.name}</h4>
          <div className="text-xs text-gray-400 w-[90%]">
            {item.productItem.size} см,{" "}
            {item.productItem.pizzaType === 1 ? "традиционное" : "тонкое"} тесто
          </div>

          {item.ingredients.length > 0 && (
            <p className="text-xs text-gray-400 w-[90%]">
              + {item.ingredients.map((i) => i.name).join(", ")}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="font-bold">
          {(item.productItem.price +
            item.ingredients.reduce((acc, i) => acc + i.price, 0)) *
            item.quantity}{" "}
          ₸
        </div>
      </div>
      <div className="flex items-center gap-3 ml-20">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="p-0 w-6 h-6 lg:w-8 lg:h-8"
            onClick={() => onClickCountButton?.(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </Button>
          <b className="text-sm">{item.quantity}</b>
          <Button
            variant="outline"
            className="p-0 w-6 h-6 lg:w-8 lg:h-8"
            onClick={() => onClickCountButton?.(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>

        <button
          onClick={() => onClickRemove?.(item.id)}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-4 lg:w-5" />
        </button>
      </div>
    </div>
  );
};
