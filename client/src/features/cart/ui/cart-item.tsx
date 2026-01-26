import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react"; // Убедись, что lucide-react установлен
import { CartItem as CartItemType } from "@/entities/cart/model/types";
import { Button } from "@/shared/ui/button";
import { Title } from "@/shared/ui/title";

interface Props {
  item: CartItemType;
  className?: string;
  // Функции прокидываем сверху, чтобы компонент был тупым
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
        {/* Изображение */}
        <div className="w-[65px] h-[65px] flex items-center justify-center bg-gray-100 rounded-full">
          <img
            src={item.productItem.product.imageUrl}
            alt={item.productItem.product.name}
            className="w-[60px] h-[60px]"
          />
        </div>

        {/* Инфо */}
        <div>
          <Title
            text={item.productItem.product.name}
            size="xs"
            className="font-bold"
          />

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

      {/* Цена */}
      <div className="w-20">
        {/* Считаем цену за 1 шт (база + ингредиенты) */}
        <div className="font-bold">
          {(item.productItem.price +
            item.ingredients.reduce((acc, i) => acc + i.price, 0)) *
            item.quantity}{" "}
          ₸
        </div>
      </div>

      {/* Каунтер */}
      <div className="flex items-center gap-3 ml-20">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="p-0 w-8 h-8"
            onClick={() => onClickCountButton?.(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </Button>
          <b className="text-sm">{item.quantity}</b>
          <Button
            variant="outline"
            className="p-0 w-8 h-8"
            onClick={() => onClickCountButton?.(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>

        <button
          onClick={() => onClickRemove?.(item.id)}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
