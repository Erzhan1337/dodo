import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { Ingredient } from "@/entities/ingredient/model/types";
import { cn } from "@/shared/lib/utils";
interface Props {
  ingredient: Ingredient;
  active?: boolean;
  onClick?: () => void;
}

export const IngredientCard = ({ ingredient, active, onClick }: Props) => {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      <div
        className={cn(
          "relative border-2 border-transparent shadow-md bg-white shrink-0 flex text-center flex-col items-center rounded-2xl py-2 transition-all duration-300",
          active && "border-primary",
        )}
      >
        {active && (
          <CircleCheck className="size-6 text-primary absolute top-2 right-2 z-5 " />
        )}
        <div className="relative w-20 h-20">
          <Image
            src={ingredient.imageUrl}
            alt={ingredient.name}
            fill
            className="object-contain"
          />
        </div>
        <div className="mt-2">
          <h4 className="text-sm font-semibold h-12">{ingredient.name}</h4>
          <span className="font-bold">{ingredient.price} ₸</span>
        </div>
      </div>
    </button>
  );
};
