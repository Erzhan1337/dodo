import { cn } from "@/shared/lib/utils";
import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: string;
}

export const FilterInput = React.forwardRef<HTMLInputElement, Props>(
  ({ className, suffix, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border border-input bg-transparent px-2 py-1 text-base shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            suffix && "pr-7",
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);

FilterInput.displayName = "FilterInput";
