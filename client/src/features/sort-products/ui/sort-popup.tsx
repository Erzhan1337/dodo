"use client";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useClickOutside, useQueryParam } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { options } from "@/features/sort-products/model/constants";
import type { Option } from "@/features/sort-products/model/types";

interface Props {
  className?: string;
}

export const SortPopup = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { value, setQueryParam } = useQueryParam("sort");
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const currentSortValue = value || "rating";
  const selectedOption =
    options.find((option) => option.value === currentSortValue) || options[0];

  const handleOptionSelect = (option: Option) => {
    setQueryParam(option.value === "rating" ? null : option.value);
    setIsOpen(false);
  };
  return (
    <div
      className={cn(
        "hidden md:block relative bg-gray-50 px-2 py-3 md:py-3 md:px-2 rounded-2xl shadow-md transition-all duration-300",
        className,
      )}
      ref={ref}
    >
      <div
        className="flex items-center gap-1 cursor-pointer text-xs md:text-base"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ArrowUpDown className="size-3 md:size-4" />
        <div className="flex items-center text-xs md:text-sm xl:text-base">
          <span className="mr-1">Сортировка:</span>
          <div className="text-primary flex items-center gap-1 [&_svg]:size-3 xl:[&_svg]:size-4">
            {selectedOption.name}
            {selectedOption.icon}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="border border-gray-300 rounded-2xl w-full absolute z-20 top-full mt-1 md:mt-2 flex flex-col py-1 md:py-3 right-0 shadow-md backdrop-blur-2xl bg-white/50">
          {options.map((option) => (
            <button
              className={cn(
                "text-xs md:text-sm flex items-center gap-1 [&_svg]:size-4 cursor-pointer hover:bg-orange-100 hover:text-primary px-5 py-1",
                currentSortValue === option.value ? "text-primary" : "",
              )}
              key={option.value}
              onClick={() => handleOptionSelect(option)}
            >
              {option.name}
              {option.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
