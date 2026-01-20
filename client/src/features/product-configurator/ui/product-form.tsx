"use client";
import { useProductForm } from "@/features/product-configurator/model/use-product-form";
import { Product } from "@/entities/product";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import { GroupVariants } from "@/features/product-configurator/ui/group-variants";
import {
  PIZZA_SIZES,
  PIZZA_TYPES,
} from "@/features/product-configurator/model/constants";
import { IngredientCard, useIngredients } from "@/entities/ingredient";

interface Props {
  product: Product;
  onSubmit?: () => void;
  className?: string;
}

export const ProductForm = ({ product, onSubmit, className }: Props) => {
  const { data: ingredients, isLoading } = useIngredients();
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
  } = useProductForm(product, ingredients);
  const { total } = totalPrice();
  if (isLoading) return <div>Loading</div>;

  return (
    <div className={cn("flex flex-1 flex-col lg:flex-row", className)}>
      {/*Left Part*/}
      <div className="w-full lg:w-[50%] flex items-center justify-center bg-white lg:rounded-tl-3xl lg:rounded-bl-3xl">
        <div className="relative w-70 h-70 lg:w-85 lg:h-85">
          <Image
            src={currentImage}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
      </div>
      {/*Right Part*/}
      <div className="bg-[#F4F1EE] w-full lg:w-[50%] lg:rounded-tr-3xl lg:rounded-br-3xl py-5 px-10">
        <div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
        </div>
        <div className="flex flex-col gap-3 mt-3">
          <GroupVariants
            items={PIZZA_SIZES.map((item) => ({
              name: item.name,
              value: item.value,
              disabled: !product.items.some(
                (pizza) => pizza.size === item.value,
              ),
            }))}
            value={size}
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
            onClick={(val) => setType(val)}
          />
        </div>
        <div className="mt-5">
          <p className="text-lg font-semibold mb-2">Добавить по вкусу</p>
          <div className="pb-2 w-full overflow-y-auto h-45 lg:h-90 gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {ingredients?.map((ingredient) => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onClick={() => toggleIngredient(ingredient.id)}
                active={selectedIngredients.has(ingredient.id)}
              />
            ))}
          </div>
        </div>
        <button
          disabled={isAvailable}
          className="font-semibold w-full mt-3 md:mt-5 bg-primary py-3 cursor-pointer rounded-2xl text-white text-lg hover:scale-95 transition-transform duration-300"
        >
          Добавить в коризну за {total} ₸{" "}
        </button>
      </div>
    </div>
  );
};
