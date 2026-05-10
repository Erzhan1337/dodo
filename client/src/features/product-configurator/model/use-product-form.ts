import { useState } from "react";
import { Ingredient, Product } from "@/entities/product";

export const useProductForm = (product: Product, ingredients: Ingredient[]) => {
  const [size, setSizeState] = useState<number>(product.items[0].size);
  const [type, setTypeState] = useState<number>(product.items[0].pizzaType);

  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(),
  );

  const setSize = (newSize: number) => {
    setSizeState(newSize);
    const isAvailable = product.items.some(
      (item) => item.size === newSize && item.pizzaType === type,
    );
    if (!isAvailable) {
      const availableItem = product.items.find((item) => item.size === newSize);
      if (availableItem) {
        setTypeState(availableItem.pizzaType);
      }
    }
  };

  const setType = (newType: number) => {
    setTypeState(newType);
    const isAvailable = product.items.some(
      (item) => item.size === size && item.pizzaType === newType,
    );
    if (!isAvailable) {
      const availableItem = product.items.find(
        (item) => item.pizzaType === newType,
      );
      if (availableItem) {
        setSizeState(availableItem.size);
      }
    }
  };

  const currentItem = product.items.find(
    (item) => item.size === size && item.pizzaType === type,
  );

  const currentItemId = currentItem?.id;

  const currentImage = currentItem?.imageUrl || product.imageUrl;

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
    currentImage,
    totalPrice,
    currentItemId,
    isAvailable,
  };
};
