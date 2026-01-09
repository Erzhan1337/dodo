import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: Props) => {
  return <div className={cn("max-w-7xl mx-auto", className)}>{children}</div>;
};
