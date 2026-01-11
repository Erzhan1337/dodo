"use client";

import { useCategories } from "@/entities/category";

import { cn } from "@/shared/lib/utils";

import { motion } from "framer-motion";

import { useQueryParam } from "@/shared/hooks";

import { Skeleton } from "@/shared/ui";

interface Props {
  className?: string;
}

export const Categories = ({ className }: Props) => {
  const { data: categories, isLoading } = useCategories();

  const { value, setQueryParam } = useQueryParam("category");

  const activeCategory = Number(value) || 0;

  const listCategories = categories
    ? [{ id: 0, name: "Все" }, ...categories]
    : [];

  const handleSelectCategory = (categoryId: number) => {
    setQueryParam(categoryId === 0 ? null : String(categoryId));
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full flex md:inline-flex items-center gap-1 p-1 rounded-2xl bg-gray-50 shadow-md",
          className,
        )}
      >
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-10 w-24" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full flex justify-between md:justify-start md:w-auto md:inline-flex items-center md:gap-1 p-1 rounded-2xl bg-gray-50 shadow-md transition-all duration-500",
        className,
      )}
    >
      {listCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelectCategory(cat.id)}
          className={cn(
            "relative p-1 md:px-3 md:py-2 z-10 cursor-pointer",

            activeCategory === cat.id ? "text-primary" : "hover:text-primary",
          )}
        >
          {activeCategory === cat.id && (
            <motion.div
              layoutId="activeCategory"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ zIndex: -1 }}
              className="absolute inset-0 bg-white rounded-xl md:rounded-2xl shadow-md"
            />
          )}

          <span className="relative text-[12px] md:text-sm">{cat.name}</span>
        </button>
      ))}
    </div>
  );
};
