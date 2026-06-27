import { cn } from "@/shared/lib/utils";
import { HTMLAttributes } from "react";

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-200/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-white/55 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
};
