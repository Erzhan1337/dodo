"use client";

import type { Category } from "@/entities/category";
import { cn } from "@/shared/lib/utils";
import { LazyMotion, m } from "framer-motion";
import { useQueryParam } from "@/shared/hooks";
import { loadMotionFeatures } from "@/shared/lib/motion";

interface Props {
  categories: Category[];
  className?: string;
}

export const Categories = ({ categories, className }: Props) => {
  const { value, setQueryParam } = useQueryParam("category");

  const activeCategory = Number(value) || 0;

  const listCategories: Category[] = [{ id: 0, name: "Все" }, ...categories];

  const handleSelectCategory = (categoryId: number) => {
    setQueryParam(categoryId === 0 ? null : String(categoryId));
  };

  return (
    <LazyMotion features={loadMotionFeatures}>
      <div
        className={cn(
          "flex w-full items-center gap-1 overflow-x-auto rounded-2xl bg-gray-50 p-1 shadow-md transition-all duration-500 [scrollbar-width:none] md:w-auto md:inline-flex md:overflow-visible [&::-webkit-scrollbar]:hidden",
          className,
        )}
      >
        {listCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className={cn(
              "relative z-10 min-h-8 shrink-0 cursor-pointer rounded-xl px-2.5 py-1.5 md:min-h-10 md:px-3 md:py-2",
              activeCategory === cat.id ? "text-primary" : "hover:text-primary",
            )}
          >
            {activeCategory === cat.id && (
              <m.div
                layoutId="activeCategory"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
                className="absolute inset-0 bg-white rounded-xl md:rounded-2xl shadow-md"
              />
            )}

            <span className="relative whitespace-nowrap text-[12px] md:text-sm xl:text-base">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </LazyMotion>
  );
};
