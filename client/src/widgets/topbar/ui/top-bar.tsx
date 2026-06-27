"use client";
import { Container } from "@/shared/ui";

import { cn } from "@/shared/lib/utils";

import { Categories } from "@/features/filter-categories";
import { useCategories } from "@/entities/category";

import { SortPopup } from "@/features/sort-products";
import { useEffect, useState } from "react";
import { TopBarSkeleton } from "@/widgets/topbar/ui/top-bar-skeleton";

interface Props {
  className?: string;
}

const TopBar = ({ className }: Props) => {
  const [isScroll, setIsScroll] = useState(false);
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScroll(true);
      } else {
        setIsScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isCategoriesLoading) {
    return <TopBarSkeleton className={className} isScroll={isScroll} />;
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-10 transition-all duration-300",
        isScroll
          ? "bg-white/80 backdrop-blur-lg shadow-sm py-2"
          : "bg-transparent shadow-none py-3",
        className,
      )}
    >
      <Container className="flex items-center justify-between">
        <Categories
          categories={categories}
          className={cn(isScroll && "bg-transparent shadow-none")}
        />

        <SortPopup className={cn(isScroll && "bg-transparent shadow-none")} />
      </Container>
    </div>
  );
};

export default TopBar;
