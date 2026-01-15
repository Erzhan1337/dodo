"use client";
import { FilterByPrice } from "@/features/filters";
import { FilterByIngredients } from "@/features/filters/ui/filter-by-ingredients";
import { Button } from "@/shared/ui";
import { useFilters } from "@/features/filters/model/use-filters";

export const SidebarFilter = () => {
  const {
    applyFilters,
    pricesRange,
    selectedIngredients,
    setPrices,
    updatePrices,
    toggleIngredients,
  } = useFilters();
  return (
    <div className="mt-3 max-w-62">
      <h4 className="text-lg font-bold mb-8">Фильтрация</h4>
      <div>
        <FilterByPrice
          priceFrom={pricesRange.priceFrom}
          priceTo={pricesRange.priceTo}
          onChange={updatePrices}
          onChangeInput={setPrices}
        />
        <div className="w-full h-px bg-gray-300 my-5" />
        <FilterByIngredients
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
