import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/format-price";
import { X } from "lucide-react";
import { CartItem as CartItemType } from "@/entities/cart/model/types";
import { Button } from "@/shared/ui/button";
import { Title } from "@/shared/ui/title";
import Image from "next/image";

const CHEESE_MODE_LABEL = {
  standard: "сыр стандарт",
  double: "двойной сыр",
  none: "без сыра",
} as const;

const PLACEMENT_LABEL = {
  whole: "",
  left: "левая половина",
  right: "правая половина",
} as const;

interface Props {
  item: CartItemType;
  className?: string;
  onClickCountButton?: (id: string, quantity: number) => void;
  onClickRemove?: (id: string) => void;
  onClickRemoveIngredient?: (itemId: string, ingredientId: string) => void;
  ingredientActionsDisabled?: boolean;
}

export const CartItem: React.FC<Props> = ({
  item,
  className,
  onClickCountButton,
  onClickRemove,
  onClickRemoveIngredient,
  ingredientActionsDisabled,
}) => {
  const isCustomPizza = Boolean(item.customDetails);
  const itemTitle = item.customName || item.productItem.product.name;
  const unitPrice =
    item.customUnitPrice ??
    item.productItem.price +
      item.ingredients.reduce((acc, ingredient) => acc + ingredient.price, 0);
  const doughLabel =
    item.productItem.pizzaType === 1 ? "традиционное" : "тонкое";
  const customIngredientLabels =
    item.customDetails?.ingredients.map((ingredient) => {
      const quantityLabel = ingredient.quantity === 2 ? " x2" : "";
      const placementLabel = PLACEMENT_LABEL[ingredient.placement];
      return `${ingredient.name}${quantityLabel}${placementLabel ? `, ${placementLabel}` : ""}`;
    }) ?? [];
  const removedIngredientLabels =
    item.customDetails?.removedIngredients.map(
      (ingredient) => `без ${ingredient.name.toLowerCase()}`,
    ) ?? [];
  const halfAndHalfLabel = item.customDetails?.halfAndHalf
    ? `Левая: ${item.customDetails.halfAndHalf.leftProduct.name} · Правая: ${item.customDetails.halfAndHalf.rightProduct.name}`
    : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center md:justify-between md:border-b-0 md:pb-0",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 md:h-15 md:w-15">
          <Image
            src={item.productItem.product.imageUrl}
            alt={item.productItem.product.name}
            fill
            sizes="(max-width: 768px) 40px, 60px"
            className="object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold leading-snug">
            {itemTitle}
          </h4>
          <div className="mt-1 text-xs text-gray-400">
            {item.productItem.size} см, {doughLabel} тесто
            {item.customDetails && (
              <>
                {" "}
                · {item.customDetails.sauce} ·{" "}
                {CHEESE_MODE_LABEL[item.customDetails.cheeseMode]}
                {item.customDetails.format === "halves" && " · две половинки"}
              </>
            )}
          </div>
          {halfAndHalfLabel && (
            <div className="mt-1 text-xs font-semibold text-primary">
              {halfAndHalfLabel}
            </div>
          )}

          {isCustomPizza && (
            <div className="mt-2 flex flex-wrap gap-2">
              {[...customIngredientLabels, ...removedIngredientLabels].map(
                (label) => (
                  <span
                    key={label}
                    className="inline-flex min-h-8 items-center rounded-full bg-orange-50 px-3 text-xs text-gray-600"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          )}

          {!isCustomPizza && item.ingredients.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.ingredients.map((ingredient) => (
                <span
                  key={ingredient.id}
                  className="inline-flex min-h-10 items-center gap-1 rounded-full bg-orange-50 pl-3 text-xs text-gray-600 md:min-h-8"
                >
                  <span className="break-words">+ {ingredient.name}</span>
                  <button
                    type="button"
                    aria-label={`Убрать ингредиент ${ingredient.name}`}
                    disabled={ingredientActionsDisabled || isCustomPizza}
                    onClick={() =>
                      onClickRemoveIngredient?.(item.id, ingredient.id)
                    }
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-orange-100 hover:text-primary disabled:pointer-events-none disabled:opacity-50 md:size-6"
                  >
                    <X className="size-5 md:size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 md:ml-8 md:justify-end">
        <div className="min-w-20 font-bold md:text-right">
          {formatPrice(unitPrice * item.quantity)}
        </div>
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
          type="button"
          onClick={() => onClickRemove?.(item.id)}
          className="flex size-10 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600 md:size-6"
          aria-label={`Удалить ${item.productItem.product.name} из корзины`}
        >
          <X className="size-5 md:size-4 lg:size-5" />
        </button>
      </div>
    </div>
  );
};
