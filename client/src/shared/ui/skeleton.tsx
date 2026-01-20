import { cn } from "@/shared/lib/utils";
import { HTMLAttributes } from "react";

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse bg-gray-200", className)}
      {...props}
    />
  );
};
