import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FilterCheckboxProps {
  text: string;
  endAdornment?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  text,
  endAdornment,
  onCheckedChange,
  checked,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          "group flex h-6 w-6 items-center justify-center rounded-[8px] border-none cursor-pointer transition-all duration-300 bg-secondary hover:bg-orange-100",
          checked && "bg-primary",
        )}
        onClick={() => onCheckedChange?.(!checked)}
      >
        <Check
          className={cn(
            "size-4 stroke-3 text-white opacity-0 transition-all duration-300",
            checked && "opacity-100",
          )}
        />
      </div>
      <label
        onClick={() => onCheckedChange?.(!checked)}
        className="leading-none cursor-pointer flex-1"
      >
        {text}
      </label>
      {endAdornment}
    </div>
  );
};
