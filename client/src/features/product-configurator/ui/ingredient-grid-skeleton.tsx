import { Skeleton } from "@/shared/ui";

export const IngredientGridSkeleton = () => {
  return (
    <div className="mt-5">
      <Skeleton className="mb-2 h-7 w-44" />
      <div className="grid h-45 w-full grid-cols-3 gap-2 overflow-hidden pb-2 md:grid-cols-4 lg:h-90 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
};
