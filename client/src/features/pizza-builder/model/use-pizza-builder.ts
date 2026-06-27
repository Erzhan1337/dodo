"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Product, ProductItem } from "@/entities/product/model/types";
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

type HalfAndHalfPair = {
  left: ProductItem;
  right: ProductItem;
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

const getFirstHalfAndHalfItem = (product?: Product) =>
  product?.items
    .filter((item) => item.size >= 30 && item.pizzaType)
    .sort((a, b) => a.size - b.size || a.price - b.price)[0];

const canProductUseHalfAndHalf = (product?: Product) =>
  Boolean(product?.canBuildHalfAndHalf && getFirstHalfAndHalfItem(product));

const getHalfAndHalfPairs = (
  leftProduct?: Product,
  rightProduct?: Product,
): HalfAndHalfPair[] => {
  if (!leftProduct || !rightProduct) {
    return [];
  }

  if (!canProductUseHalfAndHalf(leftProduct) || !canProductUseHalfAndHalf(rightProduct)) {
    return [];
  }

  const rightItemsByKey = new Map(
    rightProduct.items
      .filter((item) => item.size >= 30 && item.pizzaType)
      .map((item) => [`${item.size}:${item.pizzaType}`, item]),
  );

  return leftProduct.items
    .filter((item) => item.size >= 30 && item.pizzaType)
    .flatMap((left) => {
      const right = rightItemsByKey.get(`${left.size}:${left.pizzaType}`);
      return right ? [{ left, right }] : [];
    })
    .sort(
      (a, b) =>
        a.left.size - b.left.size ||
        a.left.pizzaType - b.left.pizzaType ||
        a.left.price - b.left.price,
    );
};

const getFirstHalfAndHalfPair = (
  leftProduct?: Product,
  rightProduct?: Product,
) => getHalfAndHalfPairs(leftProduct, rightProduct)[0];

const getCompatibleRightProduct = (
  products: Product[],
  leftProduct?: Product,
  preferredProductId?: string | null,
) => {
  if (!leftProduct) return undefined;

  const candidates = products.filter(
    (product) =>
      product.id !== leftProduct.id && canProductUseHalfAndHalf(product),
  );
  const preferredProduct = preferredProductId
    ? candidates.find((product) => product.id === preferredProductId)
    : undefined;

  if (getFirstHalfAndHalfPair(leftProduct, preferredProduct)) {
    return preferredProduct;
  }

  return candidates.find((product) =>
    getFirstHalfAndHalfPair(leftProduct, product),
  );
};

const getHalfAndHalfName = (leftProduct?: Product, rightProduct?: Product) =>
  leftProduct && rightProduct
    ? `${leftProduct.name} + ${rightProduct.name}`
    : "Моя пицца";

const isMozzarella = (ingredient: Pick<Ingredient, "name">) =>
  ingredient.name.toLowerCase().includes("моцарелла");

export const usePizzaBuilder = () => {
  const searchParams = useSearchParams();
  const requestedBaseProductId =
    searchParams.get("leftProductId") ?? searchParams.get("baseProductId");
  const requestedRightProductId = searchParams.get("rightProductId");
  const requestedFormat = searchParams.get("format");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [baseProductId, setBaseProductIdState] = useState<string>();
  const [rightProductId, setRightProductIdState] = useState<string>();
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
  const halfAndHalfProducts = useMemo(
    () => products.filter(canProductUseHalfAndHalf),
    [products],
  );

  useEffect(() => {
    if (baseProductId || products.length === 0) return;

    const queryProduct = requestedBaseProductId
      ? products.find((product) => product.id === requestedBaseProductId)
      : undefined;
    const preferredProduct =
      queryProduct ??
      products.find((product) => product.name === "Сырная") ??
      products[0];
    const shouldUseHalves =
      requestedFormat === "halves" &&
      canProductUseHalfAndHalf(preferredProduct);
    const rightProduct = shouldUseHalves
      ? getCompatibleRightProduct(
          products,
          preferredProduct,
          requestedRightProductId,
        )
      : undefined;
    const firstPair = shouldUseHalves
      ? getFirstHalfAndHalfPair(preferredProduct, rightProduct)
      : undefined;
    const firstItem = firstPair
      ? firstPair.left
      : getFirstAvailableItem(preferredProduct);

    setBaseProductIdState(preferredProduct.id);
    setRightProductIdState(rightProduct?.id);
    setSizeState(firstItem?.size ?? undefined);
    setPizzaTypeState(firstItem?.pizzaType ?? undefined);
    setFormatState(shouldUseHalves ? "halves" : "whole");
    if (shouldUseHalves) {
      setCustomName(getHalfAndHalfName(preferredProduct, rightProduct));
    }
  }, [
    baseProductId,
    products,
    requestedBaseProductId,
    requestedRightProductId,
    requestedFormat,
  ]);

  const baseProduct = products.find((product) => product.id === baseProductId);
  const rightProduct = products.find((product) => product.id === rightProductId);
  const availableItems = baseProduct?.items ?? [];
  const halfAndHalfPairs = useMemo(
    () =>
      format === "halves"
        ? getHalfAndHalfPairs(baseProduct, rightProduct)
        : [],
    [baseProduct, format, rightProduct],
  );
  const currentHalfAndHalfPair = halfAndHalfPairs.find(
    (pair) => pair.left.size === size && pair.left.pizzaType === pizzaType,
  );
  const currentItem =
    format === "halves"
      ? currentHalfAndHalfPair?.left
      : availableItems.find(
          (item) => item.size === size && item.pizzaType === pizzaType,
        );
  const rightCurrentItem =
    format === "halves" ? currentHalfAndHalfPair?.right : undefined;
  const mozzarella = ingredients.find(isMozzarella);
  const baseIngredients = useMemo(() => {
    const ingredientById = new Map<string, Ingredient>();

    for (const ingredient of baseProduct?.ingredients ?? []) {
      ingredientById.set(ingredient.id, ingredient);
    }

    if (format === "halves") {
      for (const ingredient of rightProduct?.ingredients ?? []) {
        ingredientById.set(ingredient.id, ingredient);
      }
    }

    return [...ingredientById.values()];
  }, [baseProduct, format, rightProduct]);
  const baseMozzarella = baseIngredients.find(isMozzarella);

  const availableSizes = useMemo(
    () => {
      const source =
        format === "halves"
          ? halfAndHalfPairs.map((pair) => pair.left)
          : availableItems;

      return [...new Set(source.map((item) => item.size).filter(Boolean))]
        .map(Number)
        .sort((a, b) => a - b);
    },
    [availableItems, format, halfAndHalfPairs],
  );

  const availablePizzaTypes = useMemo(
    () => {
      const source =
        format === "halves"
          ? halfAndHalfPairs.map((pair) => pair.left)
          : availableItems;

      return [
        ...new Set(
          source
            .filter((item) => item.size === size)
            .map((item) => item.pizzaType)
            .filter(Boolean),
        ),
      ]
        .map(Number)
        .sort((a, b) => a - b);
    },
    [availableItems, format, halfAndHalfPairs, size],
  );

  const baseIngredientIds = new Set(
    baseIngredients.map((ingredient) => ingredient.id),
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
  const baseUnitPrice =
    format === "halves" && currentItem && rightCurrentItem
      ? Math.round(currentItem.price / 2 + rightCurrentItem.price / 2)
      : currentItem?.price ?? 0;
  const totalPrice = baseUnitPrice + ingredientsPrice;

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
  const compatibleRightProduct = useMemo(
    () =>
      rightProduct && getFirstHalfAndHalfPair(baseProduct, rightProduct)
        ? rightProduct
        : getCompatibleRightProduct(products, baseProduct, rightProductId),
    [baseProduct, products, rightProduct, rightProductId],
  );
  const canUseHalves =
    Boolean(getFirstHalfAndHalfPair(baseProduct, compatibleRightProduct)) &&
    (format === "whole" || (size ?? 0) >= 30);
  const canSubmit = Boolean(
    currentItem && (format === "whole" || rightCurrentItem),
  );

  const setBaseProductId = (productId: string) => {
    const nextProduct = products.find((product) => product.id === productId);

    if (!nextProduct) return;

    if (format === "halves") {
      const nextRightProduct =
        rightProduct && getFirstHalfAndHalfPair(nextProduct, rightProduct)
          ? rightProduct
          : getCompatibleRightProduct(products, nextProduct, rightProductId);
      const preferredPair =
        getHalfAndHalfPairs(nextProduct, nextRightProduct).find(
          (pair) =>
            pair.left.size === size && pair.left.pizzaType === pizzaType,
        ) ?? getFirstHalfAndHalfPair(nextProduct, nextRightProduct);

      setBaseProductIdState(productId);
      setRightProductIdState(nextRightProduct?.id);
      setSizeState(preferredPair?.left.size ?? undefined);
      setPizzaTypeState(preferredPair?.left.pizzaType ?? undefined);
      setCustomName(getHalfAndHalfName(nextProduct, nextRightProduct));
      setRemovedBaseIngredientIds(new Set());
      return;
    }

    const preferredItem =
      nextProduct?.items.find(
        (item) => item.size === size && item.pizzaType === pizzaType,
      ) ?? getFirstAvailableItem(nextProduct);

    setBaseProductIdState(productId);
    setSizeState(preferredItem?.size ?? undefined);
    setPizzaTypeState(preferredItem?.pizzaType ?? undefined);
    setRemovedBaseIngredientIds(new Set());
  };

  const setRightHalfProductId = (productId: string) => {
    if (format !== "halves" || productId === baseProductId) return;

    const nextProduct = products.find((product) => product.id === productId);
    const preferredPair =
      getHalfAndHalfPairs(baseProduct, nextProduct).find(
        (pair) => pair.left.size === size && pair.left.pizzaType === pizzaType,
      ) ?? getFirstHalfAndHalfPair(baseProduct, nextProduct);

    if (!preferredPair) return;

    setRightProductIdState(productId);
    setSizeState(preferredPair.left.size);
    setPizzaTypeState(preferredPair.left.pizzaType);
    setCustomName(getHalfAndHalfName(baseProduct, nextProduct));
    setRemovedBaseIngredientIds(new Set());
  };

  const setSize = (nextSize: number) => {
    if (format === "halves") {
      const preferredPair =
        halfAndHalfPairs.find(
          (pair) =>
            pair.left.size === nextSize && pair.left.pizzaType === pizzaType,
        ) ?? halfAndHalfPairs.find((pair) => pair.left.size === nextSize);

      setSizeState(preferredPair?.left.size ?? nextSize);
      setPizzaTypeState(preferredPair?.left.pizzaType ?? undefined);
      return;
    }

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
    if (format === "halves") {
      const preferredPair =
        halfAndHalfPairs.find(
          (pair) =>
            pair.left.size === size && pair.left.pizzaType === nextPizzaType,
        ) ??
        halfAndHalfPairs.find(
          (pair) => pair.left.pizzaType === nextPizzaType,
        );

      setPizzaTypeState(nextPizzaType);

      if (preferredPair?.left.size && preferredPair.left.size !== size) {
        setSizeState(preferredPair.left.size);
      }

      return;
    }

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
    if (nextFormat === "halves") {
      const nextRightProduct =
        rightProduct && getFirstHalfAndHalfPair(baseProduct, rightProduct)
          ? rightProduct
          : getCompatibleRightProduct(products, baseProduct, rightProductId);
      const preferredPair =
        getHalfAndHalfPairs(baseProduct, nextRightProduct).find(
          (pair) =>
            pair.left.size === size && pair.left.pizzaType === pizzaType,
        ) ?? getFirstHalfAndHalfPair(baseProduct, nextRightProduct);

      if (!preferredPair) return;

      setFormatState("halves");
      setRightProductIdState(nextRightProduct?.id);
      setSizeState(preferredPair.left.size);
      setPizzaTypeState(preferredPair.left.pizzaType);
      setCustomName(getHalfAndHalfName(baseProduct, nextRightProduct));
      return;
    }

    setFormatState(nextFormat);

    setSelectedIngredients((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, ingredient]) => [
          id,
          { ...ingredient, placement: "whole" },
        ]),
      ),
    );
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
          halfAndHalf:
            format === "halves" && rightCurrentItem
              ? {
                  leftProductItemId: currentItem.id,
                  rightProductItemId: rightCurrentItem.id,
                }
              : undefined,
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
    rightProduct,
    rightProductId,
    products,
    halfAndHalfProducts,
    ingredients,
    baseIngredients,
    availableSizes,
    availablePizzaTypes,
    currentItem,
    rightCurrentItem,
    baseUnitPrice,
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
    setRightHalfProductId,
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
