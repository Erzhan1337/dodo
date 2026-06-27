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
          "relative border-2 border-transparent shadow-md bg-white shrink-0 flex text-center flex-col items-center rounded-2xl py-1.5 transition-all duration-300",
          active && "border-primary",
        )}
      >
        {active && (
          <CircleCheck className="size-5 text-primary absolute top-1.5 right-1.5 z-5 " />
        )}
        <div className="relative size-18">
          <Image
            src={ingredient.imageUrl}
            alt={ingredient.name}
            fill
            sizes="(max-width: 768px) 72px, 72px"
            className="object-contain"
          />
        </div>
        <div className="mt-1.5">
          <h4 className="h-10 text-[13px] font-semibold leading-5">
            {ingredient.name}
          </h4>
          <span className="text-sm font-bold">{ingredient.price} ₸</span>
        </div>
      </div>
    </button>
  );
};
