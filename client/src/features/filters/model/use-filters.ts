import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export const useFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { initialPrices, initialIngredients } = useMemo(() => {
    return {
      initialPrices: {
        priceFrom: Number(searchParams.get("from")) || undefined,
        priceTo: Number(searchParams.get("to")) || undefined,
      },
      initialIngredients: new Set(searchParams.get("ing")?.split(",") || []),
    };
  }, [searchParams]);

  const [pricesRange, setPricesRange] = useState(initialPrices);
  const [selectedIngredients, setSelectedIngredients] =
    useState<Set<string>>(initialIngredients);

  const setPrices = useCallback((name: string, value: number) => {
    setPricesRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const updatePrices = useCallback((values: number[]) => {
    setPricesRange({
      priceFrom: values[0],
      priceTo: values[1],
    });
  }, []);

  const toggleIngredients = useCallback((name: string) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (pricesRange.priceFrom)
      params.set("from", String(pricesRange.priceFrom));
    else params.delete("from");

    if (pricesRange.priceTo) params.set("to", String(pricesRange.priceTo));
    else params.delete("to");

    if (selectedIngredients.size > 0) {
      params.set("ing", Array.from(selectedIngredients).join(","));
    } else params.delete("ing");

    params.delete("page");

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, selectedIngredients, pricesRange]);

  return {
    pricesRange,
    selectedIngredients,
    setPrices,
    updatePrices,
    toggleIngredients,
    applyFilters,
  };
};
