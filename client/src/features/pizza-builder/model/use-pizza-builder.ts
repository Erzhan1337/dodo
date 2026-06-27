"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/entities/product/model/types";
import type { Ingredient } from "@/entities/ingredient/model/types";
import type {
  CreateCartItemValues,
  CustomPizzaCheeseMode,
  CustomPizzaFormat,
  CustomPizzaPlacement,
} from "@/entities/cart/model/types";
import { $api } from "@/shared/api";
import {
  PIZZA_BUILDER_MAX_DOUBLE_INGREDIENTS,
  PIZZA_BUILDER_MAX_INGREDIENTS,
  PIZZA_SAUCE_OPTIONS,
} from "@/features/pizza-builder/model/constants";

type ProductsResponse = {
  data: Product[];
};

type SelectedIngredient = {
  quantity: 1 | 2;
  placement: CustomPizzaPlacement;
};

export type BuilderIngredientLine = Ingredient &
  SelectedIngredient & {
    linePrice: number;
    source: "topping" | "cheese";
  };

const BASE_WEIGHT_BY_SIZE: Record<number, number> = {
  25: 430,
  30: 620,
  35: 820,
};

const INGREDIENT_WEIGHT_BY_SIZE: Record<number, number> = {
  25: 26,
  30: 36,
  35: 48,
};

const getPlacementRatio = (placement: CustomPizzaPlacement) =>
  placement === "whole" ? 1 : 0.5;

const getLinePrice = (
  ingredient: Pick<Ingredient, "price">,
  quantity: 1 | 2,
  placement: CustomPizzaPlacement,
) => Math.round(ingredient.price * quantity * getPlacementRatio(placement));

const getFirstAvailableItem = (product?: Product) =>
  product?.items
    .filter((item) => item.size && item.pizzaType)
    .sort((a, b) => a.price - b.price)[0];

const isMozzarella = (ingredient: Pick<Ingredient, "name">) =>
  ingredient.name.toLowerCase().includes("моцарелла");

export const usePizzaBuilder = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [baseProductId, setBaseProductIdState] = useState<string>();
  const [size, setSizeState] = useState<number>();
  const [pizzaType, setPizzaTypeState] = useState<number>();
  const [format, setFormatState] = useState<CustomPizzaFormat>("whole");
  const [sauce, setSauce] = useState<string>(PIZZA_SAUCE_OPTIONS[0].id);
  const [cheeseMode, setCheeseMode] =
    useState<CustomPizzaCheeseMode>("standard");
  const [bakeMode, setBakeMode] = useState("standard");
  const [sliceMode, setSliceMode] = useState("standard");
  const [customName, setCustomName] = useState("Моя пицца");
  const [selectedIngredients, setSelectedIngredients] = useState<
    Record<string, SelectedIngredient>
  >({});
  const [removedBaseIngredientIds, setRemovedBaseIngredientIds] = useState<
    Set<string>
  >(new Set());

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["pizza-builder-data"],
    queryFn: async () => {
      const [productsResponse, ingredientsResponse] = await Promise.all([
        $api.get<ProductsResponse>("/product/all", {
          params: { limit: 50 },
        }),
        $api.get<Ingredient[]>("/ingredients"),
      ]);

      return {
        products: productsResponse.data.data.filter(
          (product) => getFirstAvailableItem(product) != null,
        ),
        ingredients: ingredientsResponse.data,
      };
    },
  });

  const products = data?.products ?? [];
  const ingredients = data?.ingredients ?? [];

  useEffect(() => {
    if (baseProductId || products.length === 0) return;

    const preferredProduct =
      products.find((product) => product.name === "Сырная") ?? products[0];
    const firstItem = getFirstAvailableItem(preferredProduct);

    setBaseProductIdState(preferredProduct.id);
    setSizeState(firstItem?.size ?? undefined);
    setPizzaTypeState(firstItem?.pizzaType ?? undefined);
  }, [baseProductId, products]);

  const baseProduct = products.find((product) => product.id === baseProductId);
  const availableItems = baseProduct?.items ?? [];
  const currentItem = availableItems.find(
    (item) => item.size === size && item.pizzaType === pizzaType,
  );
  const mozzarella = ingredients.find(isMozzarella);
  const baseMozzarella = baseProduct?.ingredients.find(isMozzarella);

  const availableSizes = useMemo(
    () =>
      [...new Set(availableItems.map((item) => item.size).filter(Boolean))]
        .map(Number)
        .sort((a, b) => a - b),
    [availableItems],
  );

  const availablePizzaTypes = useMemo(
    () =>
      [
        ...new Set(
          availableItems
            .filter((item) => item.size === size)
            .map((item) => item.pizzaType)
            .filter(Boolean),
        ),
      ]
        .map(Number)
        .sort((a, b) => a - b),
    [availableItems, size],
  );

  const baseIngredientIds = new Set(
    baseProduct?.ingredients.map((ingredient) => ingredient.id) ?? [],
  );

  const selectedIngredientLines = useMemo<BuilderIngredientLine[]>(() => {
    return Object.entries(selectedIngredients)
      .flatMap(([id, selected]) => {
        const ingredient = ingredients.find((item) => item.id === id);
        if (!ingredient) return [];

        return [{
          ...ingredient,
          ...selected,
          linePrice: getLinePrice(
            ingredient,
            selected.quantity,
            selected.placement,
          ),
          source: "topping" as const,
        }];
      });
  }, [ingredients, selectedIngredients]);

  const cheeseExtraLine = useMemo<BuilderIngredientLine | null>(() => {
    if (cheeseMode !== "double" || !mozzarella) return null;
    if (selectedIngredients[mozzarella.id]) return null;

    return {
      ...mozzarella,
      quantity: 1,
      placement: "whole",
      linePrice: mozzarella.price,
      source: "cheese",
    };
  }, [cheeseMode, mozzarella, selectedIngredients]);

  const builderIngredientLines = useMemo(
    () =>
      cheeseExtraLine
        ? [...selectedIngredientLines, cheeseExtraLine]
        : selectedIngredientLines,
    [cheeseExtraLine, selectedIngredientLines],
  );

  const removedIngredientIds = useMemo(() => {
    const ids = new Set(removedBaseIngredientIds);

    if (cheeseMode === "none" && baseMozzarella) {
      ids.add(baseMozzarella.id);
    }

    return [...ids].sort();
  }, [baseMozzarella, cheeseMode, removedBaseIngredientIds]);

  const ingredientsPrice = builderIngredientLines.reduce(
    (sum, ingredient) => sum + ingredient.linePrice,
    0,
  );
  const totalPrice = (currentItem?.price ?? 0) + ingredientsPrice;

  const estimatedWeight = useMemo(() => {
    const baseWeight = BASE_WEIGHT_BY_SIZE[size ?? 30] ?? 620;
    const doughAdjustment = pizzaType === 2 ? -45 : 0;
    const ingredientWeight = builderIngredientLines.reduce(
      (sum, ingredient) =>
        sum +
        (INGREDIENT_WEIGHT_BY_SIZE[size ?? 30] ?? 36) *
          ingredient.quantity *
          getPlacementRatio(ingredient.placement),
      0,
    );

    return Math.round(baseWeight + doughAdjustment + ingredientWeight);
  }, [builderIngredientLines, pizzaType, size]);

  const estimatedCalories = Math.round(estimatedWeight * 2.35);
  const selectedCount = Object.keys(selectedIngredients).length;
  const doubleCount = Object.values(selectedIngredients).filter(
    (ingredient) => ingredient.quantity === 2,
  ).length;
  const canUseHalves = (size ?? 0) >= 30;
  const canSubmit = Boolean(currentItem);

  const setBaseProductId = (productId: string) => {
    const nextProduct = products.find((product) => product.id === productId);
    const preferredItem =
      nextProduct?.items.find(
        (item) => item.size === size && item.pizzaType === pizzaType,
      ) ?? getFirstAvailableItem(nextProduct);

    setBaseProductIdState(productId);
    setSizeState(preferredItem?.size ?? undefined);
    setPizzaTypeState(preferredItem?.pizzaType ?? undefined);
    setRemovedBaseIngredientIds(new Set());
  };

  const setSize = (nextSize: number) => {
    const preferredItem =
      availableItems.find(
        (item) => item.size === nextSize && item.pizzaType === pizzaType,
      ) ?? availableItems.find((item) => item.size === nextSize);

    setSizeState(nextSize);
    setPizzaTypeState(preferredItem?.pizzaType ?? undefined);

    if (nextSize < 30) {
      setFormatState("whole");
      setSelectedIngredients((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([id, ingredient]) => [
            id,
            { ...ingredient, placement: "whole" },
          ]),
        ),
      );
    }
  };

  const setPizzaType = (nextPizzaType: number) => {
    const preferredItem =
      availableItems.find(
        (item) => item.size === size && item.pizzaType === nextPizzaType,
      ) ?? availableItems.find((item) => item.pizzaType === nextPizzaType);

    setPizzaTypeState(nextPizzaType);

    if (preferredItem?.size && preferredItem.size !== size) {
      setSizeState(preferredItem.size);
    }
  };

  const setFormat = (nextFormat: CustomPizzaFormat) => {
    if (nextFormat === "halves" && !canUseHalves) return;

    setFormatState(nextFormat);

    if (nextFormat === "whole") {
      setSelectedIngredients((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([id, ingredient]) => [
            id,
            { ...ingredient, placement: "whole" },
          ]),
        ),
      );
    }
  };

  const setIngredientQuantity = (id: string, quantity: 0 | 1 | 2) => {
    const existing = selectedIngredients[id];

    if (quantity === 0) {
      setSelectedIngredients((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return true;
    }

    if (!existing && selectedCount >= PIZZA_BUILDER_MAX_INGREDIENTS) {
      return false;
    }

    if (
      quantity === 2 &&
      existing?.quantity !== 2 &&
      doubleCount >= PIZZA_BUILDER_MAX_DOUBLE_INGREDIENTS
    ) {
      return false;
    }

    setSelectedIngredients((prev) => ({
      ...prev,
      [id]: {
        quantity,
        placement:
          format === "whole" ? "whole" : prev[id]?.placement ?? "whole",
      },
    }));

    return true;
  };

  const setIngredientPlacement = (
    id: string,
    placement: CustomPizzaPlacement,
  ) => {
    if (format === "whole" && placement !== "whole") return;

    setSelectedIngredients((prev) => {
      const selected = prev[id];
      if (!selected) return prev;

      return {
        ...prev,
        [id]: {
          ...selected,
          placement,
        },
      };
    });
  };

  const toggleBaseIngredient = (id: string) => {
    if (!baseIngredientIds.has(id)) return;

    setRemovedBaseIngredientIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const nextStep = () =>
    setActiveStepIndex((index) => Math.min(index + 1, 4));
  const prevStep = () =>
    setActiveStepIndex((index) => Math.max(index - 1, 0));

  const cartPayload: CreateCartItemValues | null = currentItem
    ? {
        productItemId: currentItem.id,
        customPizza: {
          name: customName,
          format,
          sauce,
          cheeseMode,
          bakeMode,
          sliceMode,
          ingredients: builderIngredientLines.map((ingredient) => ({
            id: ingredient.id,
            quantity: ingredient.quantity,
            placement: ingredient.placement,
          })),
          removedIngredientIds,
        },
      }
    : null;

  return {
    activeStepIndex,
    setActiveStepIndex,
    baseProduct,
    baseProductId,
    products,
    ingredients,
    availableSizes,
    availablePizzaTypes,
    currentItem,
    size,
    pizzaType,
    format,
    sauce,
    cheeseMode,
    bakeMode,
    sliceMode,
    customName,
    selectedIngredients,
    removedIngredientIds,
    builderIngredientLines,
    totalPrice,
    estimatedWeight,
    estimatedCalories,
    selectedCount,
    doubleCount,
    canUseHalves,
    canSubmit,
    isLoading,
    isError,
    isFetching,
    refetch,
    setBaseProductId,
    setSize,
    setPizzaType,
    setFormat,
    setSauce,
    setCheeseMode,
    setBakeMode,
    setSliceMode,
    setCustomName,
    setIngredientQuantity,
    setIngredientPlacement,
    toggleBaseIngredient,
    nextStep,
    prevStep,
    cartPayload,
  };
};
