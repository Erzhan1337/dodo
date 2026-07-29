import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui";

export const IngredientGridSkeleton = ({
  compact = false,
}: {
  compact?: boolean;
}) => {
  return (
    <div className={cn("mt-5", compact && "mt-3 lg:mt-5")}>
      <Skeleton
        className={cn("mb-2 h-7 w-44", compact && "h-6 w-36 lg:h-7 lg:w-44")}
      />
      <div
        className={cn(
          "grid h-45 w-full grid-cols-3 gap-2 overflow-hidden pb-2 md:grid-cols-4 lg:h-90 lg:grid-cols-3",
          compact && "h-auto lg:h-90",
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-28 w-full", compact && "h-24 lg:h-28")}
          />
        ))}
      </div>
    </div>
  );
};
