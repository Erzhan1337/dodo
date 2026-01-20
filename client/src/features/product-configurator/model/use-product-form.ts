import { useState } from "react";
import type { Ingredient, Product } from "@/entities/product";

export const useProductForm = (
  product: Product,
  ingredients: Ingredient[] = [],
) => {
  const [size, setSize] = useState(product.items[0].size || 25);
  const [type, setType] = useState(product.items[0].pizzaType || 1);
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());

  const currentVariation = product.items.find(
    (item) => item.size === size && item.pizzaType === type,
  );

  const currentImage = currentVariation?.imageUrl || product.imageUrl;

  const availablePizzas = product.items;

  const isAvailable = Boolean(currentVariation);

  const updateSize = (newSize: number) => {
    const isAvailableVariation = availablePizzas.some(
      (i) => i.size === newSize && i.pizzaType === type,
    );

    if (!isAvailableVariation) {
      const availableVariation = availablePizzas.find(
        (i) => i.size === newSize,
      );
      if (availableVariation) {
        setType(availableVariation.pizzaType);
      }
    }
    setSize(newSize);
  };

  const toggleIngredient = (id: string) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const totalPrice = () => {
    const pizzaPrice = currentVariation?.price || 0;
    const ingredientsPrice = ingredients
      .filter((ing) => selectedIngredients.has(ing.id))
      .reduce((acc, ing) => acc + ing.price, 0);
    const total = pizzaPrice + ingredientsPrice;

    return { total, pizzaPrice, ingredientsPrice };
  };

  return {
    size,
    type,
    selectedIngredients,
    setSize: updateSize,
    setType,
    setSelectedIngredients,
    toggleIngredient,
    currentImage,
    totalPrice,
    isAvailable,
  };
};
