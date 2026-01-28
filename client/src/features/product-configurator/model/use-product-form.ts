import { useState } from "react";
import { Ingredient, Product } from "@/entities/product";

export const useProductForm = (product: Product, ingredients: Ingredient[]) => {
  const [size, setSize] = useState<number>(product.items[0].size);
  const [type, setType] = useState<number>(product.items[0].pizzaType);

  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(),
  );

  const currentItemId = product.items.find(
    (item) => item.size === size && item.pizzaType === type,
  )?.id;

  const toggleIngredient = (id: string) => {
    const newIngredients = new Set(selectedIngredients);
    if (newIngredients.has(id)) {
      newIngredients.delete(id);
    } else {
      newIngredients.add(id);
    }
    setSelectedIngredients(newIngredients);
  };

  const totalPrice = () => {
    const productItem = product.items.find(
      (item) => item.size === size && item.pizzaType === type,
    );

    if (!productItem) return { total: 0 };

    const ingredientsPrice = ingredients
      .filter((ing) => selectedIngredients.has(ing.id))
      .reduce((acc, ing) => acc + ing.price, 0);

    return { total: productItem.price + ingredientsPrice };
  };
  const isAvailable = Boolean(currentItemId);
  return {
    size,
    type,
    selectedIngredients,
    setSize,
    setType,
    toggleIngredient,
    currentImage: product.imageUrl,
    totalPrice,
    currentItemId,
    isAvailable,
  };
};
