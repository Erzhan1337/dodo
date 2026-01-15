"use client";

import { ComponentRef, forwardRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/shared/lib/utils";

interface Props {
  className?: string;
  min: number;
  max: number;
  step?: number;
  value?: number[];
  onValueChange?: (values: number[]) => void;
}

export const RangeSlider = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  Props
>(({ className, min, max, step = 1, value, onValueChange, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {/* Левый ползунок */}
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      {/* Правый ползунок */}
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
});

RangeSlider.displayName = SliderPrimitive.Root.displayName;
