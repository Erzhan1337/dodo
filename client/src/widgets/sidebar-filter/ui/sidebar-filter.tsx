"use client";
import { useIngredients } from "@/entities/ingredient";
import { FilterByPrice } from "@/features/filters";
import { FilterByIngredients } from "@/features/filters/ui/filter-by-ingredients";
import { Button } from "@/shared/ui";
import { useFilters } from "@/features/filters/model/use-filters";
import { SidebarFilterSkeleton } from "@/widgets/sidebar-filter/ui/sidebar-filter-skeleton";

export const SidebarFilter = () => {
  const {
    applyFilters,
    pricesRange,
    selectedIngredients,
    setPrices,
    updatePrices,
    toggleIngredients,
  } = useFilters();
  const { data: ingredients = [], isLoading: isIngredientsLoading } =
    useIngredients();

  if (isIngredientsLoading) {
    return <SidebarFilterSkeleton />;
  }

  return (
    <div className="hidden lg:block lg:max-w-62">
      <h4 className="text-lg font-semibold mb-8">Фильтрация</h4>
      <div>
        <FilterByPrice
          priceFrom={pricesRange.priceFrom}
          priceTo={pricesRange.priceTo}
          onChange={updatePrices}
          onChangeInput={setPrices}
        />
        <div className="w-full h-px bg-zinc-300 my-5" />
        <FilterByIngredients
          ingredients={ingredients}
          selectedIngs={selectedIngredients}
          onChange={toggleIngredients}
        />

        <Button className="w-full mt-5" onClick={applyFilters}>
          Применить
        </Button>
      </div>
    </div>
  );
};
