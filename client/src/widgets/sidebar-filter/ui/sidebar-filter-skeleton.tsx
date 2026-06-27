import { Button, Skeleton } from "@/shared/ui";

export const SidebarFilterSkeleton = () => {
  return (
    <div className="hidden lg:block lg:max-w-62">
      <Skeleton className="mb-8 h-7 w-28" />
      <div>
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="mb-5 flex items-center gap-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <div className="my-5 h-px w-full bg-zinc-300" />
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="flex h-46 w-full flex-col gap-2">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <Skeleton className="h-6 w-full" key={id} />
          ))}
        </div>
        <Button className="mt-5 w-full" disabled>
          Применить
        </Button>
      </div>
    </div>
  );
};
