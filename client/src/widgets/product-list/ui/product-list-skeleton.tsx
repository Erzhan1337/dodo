import { Skeleton } from "@/shared/ui";

const PLACEHOLDER_CARDS = Array.from({ length: 6 });

export const ProductListSkeleton = () => {
  return (
    <div className="min-w-0 flex-1">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
        {PLACEHOLDER_CARDS.map((_, index) => (
          <div key={index}>
            <div className="flex h-44 items-center justify-center rounded-2xl bg-[#FFF7EE] sm:h-50 md:h-70">
              <Skeleton className="size-36 rounded-full bg-zinc-300/70 sm:size-45 md:size-54" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-7 w-3/4" />
              <div className="mt-2 flex h-15 flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="mt-5 flex items-center justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-10 w-28 rounded-xl sm:w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
