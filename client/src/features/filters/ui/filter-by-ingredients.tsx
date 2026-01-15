"use client";
import { useMemo, useState } from "react";
import { useIngredients } from "@/entities/ingredient";
import { FilterCheckbox } from "@/shared/ui";

interface Props {
  selectedIngs: Set<string>;
  onChange: (id: string) => void;
}

export const FilterByIngredients = ({ selectedIngs, onChange }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: ingredients = [] } = useIngredients();
  const items = useMemo(() => {
    const filtered = ingredients.filter((ing: any) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase().replace(/\s/g, "")),
    );
    return [...filtered].sort((a, b) => {
      const isASelected = selectedIngs.has(a.name);
      const isBSelected = selectedIngs.has(b.name);
      if (isASelected === isBSelected) return 0;
      return isASelected ? -1 : 1;
    });
  }, [ingredients, searchTerm, selectedIngs]);

  const visibleItems = showAll ? items : items.slice(0, 6);

  return (
    <div className="mt-5">
      {showAll && (
        <div className="border border-gray-200 rounded-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск..."
            className="outline-0 pl-3 py-1"
          />
        </div>
      )}
      <div className="mt-3 flex flex-col gap-2 h-46 max-h-46 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleItems.length > 0 &&
          visibleItems.map((ingredient: any) => (
            <FilterCheckbox
              key={ingredient.id}
              text={ingredient.name}
              checked={selectedIngs?.has(String(ingredient.name))}
              onCheckedChange={() => onChange(ingredient.name)}
            />
          ))}
        {visibleItems.length <= 0 && showAll && (
          <span className="text-primary">Ничего не найдено(</span>
        )}
      </div>
      <div className="flex justify-start mt-3">
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="text-primary"
        >
          {!showAll ? "+ Показать все" : "- Скрыть"}
        </button>
      </div>
    </div>
  );
};
