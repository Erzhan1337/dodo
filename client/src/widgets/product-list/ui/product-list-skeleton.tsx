import { Skeleton } from "@/shared/ui";

const PLACEHOLDER_CARDS = Array.from({ length: 6 });

export const ProductListSkeleton = () => {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_CARDS.map((_, index) => (
          <div key={index}>
            {/* Mirrors ProductCard geometry so swapping skeleton -> card causes no layout shift */}
            <div className="flex h-50 items-center justify-center rounded-2xl bg-[#FFF7EE] md:h-70">
              <Skeleton className="h-45 w-45 rounded-full bg-zinc-300/70 md:h-54 md:w-54" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-7 w-3/4" />
              <div className="mt-2 flex h-15 flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="mt-5 flex items-center justify-between">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
