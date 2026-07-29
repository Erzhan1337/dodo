import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { Ingredient } from "@/entities/ingredient/model/types";
import { cn } from "@/shared/lib/utils";
interface Props {
  ingredient: Ingredient;
  active?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const IngredientCard = ({
  ingredient,
  active,
  onClick,
  compact = false,
}: Props) => {
  return (
    <button className="min-w-0 cursor-pointer" onClick={onClick}>
      <div
        className={cn(
          "relative border-2 border-transparent shadow-md bg-white shrink-0 flex text-center flex-col items-center rounded-2xl py-1.5 transition-all duration-300",
          compact && "rounded-xl py-1 lg:rounded-2xl lg:py-1.5",
          active && "border-primary",
        )}
      >
        {active && (
          <CircleCheck className="size-5 text-primary absolute top-1.5 right-1.5 z-5 " />
        )}
        <div
          className={cn(
            "relative size-18",
            compact && "size-12 sm:size-14 lg:size-18",
          )}
        >
          <Image
            src={ingredient.imageUrl}
            alt={ingredient.name}
            fill
            sizes="(max-width: 768px) 72px, 72px"
            className="object-contain"
          />
        </div>
        <div className={cn("mt-1.5", compact && "mt-1 lg:mt-1.5")}>
          <h4
            className={cn(
              "h-10 text-[13px] font-semibold leading-5",
              compact &&
                "h-8 px-0.5 text-[11px] leading-4 sm:text-xs lg:h-10 lg:text-[13px] lg:leading-5",
            )}
          >
            {ingredient.name}
          </h4>
          <span
            className={cn(
              "text-sm font-bold",
              compact && "text-xs lg:text-sm",
            )}
          >
            {ingredient.price} ₸
          </span>
        </div>
      </div>
    </button>
  );
};
