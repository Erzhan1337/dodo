import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: Props) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
};
