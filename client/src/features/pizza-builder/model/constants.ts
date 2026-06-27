import type { Ingredient } from "@/entities/ingredient/model/types";

export const PIZZA_BUILDER_MAX_INGREDIENTS = 8;
export const PIZZA_BUILDER_MAX_DOUBLE_INGREDIENTS = 4;

export const PIZZA_BUILDER_STEPS = [
  { id: "base", label: "Основа" },
  { id: "size", label: "Размер" },
  { id: "sauce", label: "Соус" },
  { id: "toppings", label: "Ингредиенты" },
  { id: "review", label: "Итог" },
] as const;

export type PizzaBuilderStepId = (typeof PIZZA_BUILDER_STEPS)[number]["id"];

export const PIZZA_SAUCE_OPTIONS = [
  { id: "Томатный соус", name: "Томатный", description: "Классическая база" },
  { id: "Соус альфредо", name: "Альфредо", description: "Сливочный вкус" },
  { id: "BBQ соус", name: "BBQ", description: "Копченая сладость" },
  { id: "Острый томатный соус", name: "Острый", description: "С перцем" },
] as const;

export const PIZZA_CHEESE_OPTIONS = [
  { value: "standard", label: "Стандарт" },
  { value: "double", label: "Двойной" },
  { value: "none", label: "Без сыра" },
] as const;

export const PIZZA_BAKE_OPTIONS = [
  { value: "standard", label: "Обычная" },
  { value: "well-done", label: "Подрумянить" },
] as const;

export const PIZZA_SLICE_OPTIONS = [
  { value: "standard", label: "Стандарт" },
  { value: "more-slices", label: "Больше кусочков" },
] as const;

export const PIZZA_TYPE_LABELS: Record<number, string> = {
  1: "Традиционное",
  2: "Тонкое",
};

export const PIZZA_SIZE_LABELS: Record<number, string> = {
  25: "Маленькая",
  30: "Средняя",
  35: "Большая",
};

export const INGREDIENT_CATEGORY_LABELS = [
  "Популярное",
  "Мясо",
  "Сыр",
  "Овощи",
  "Грибы",
  "Острое",
  "Соусы и травы",
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORY_LABELS)[number];

const includesAny = (value: string, words: string[]) =>
  words.some((word) => value.includes(word));

export const getIngredientCategory = (
  ingredient: Pick<Ingredient, "name">,
): IngredientCategory => {
  const name = ingredient.name.toLowerCase();

  if (
    includesAny(name, [
      "пепперони",
      "ветчина",
      "цыпленок",
      "колбас",
      "фрикадель",
    ])
  ) {
    return "Мясо";
  }

  if (includesAny(name, ["моцарелла", "чеддер", "пармезан", "сыр"])) {
    return "Сыр";
  }

  if (includesAny(name, ["шампиньон", "гриб"])) {
    return "Грибы";
  }

  if (includesAny(name, ["халапеньо", "остр"])) {
    return "Острое";
  }

  if (includesAny(name, ["трав", "соус", "бортик"])) {
    return "Соусы и травы";
  }

  if (
    includesAny(name, [
      "лук",
      "огур",
      "ананас",
      "томат",
      "перец",
      "олив",
      "маслин",
      "кукуруз",
    ])
  ) {
    return "Овощи";
  }

  return "Популярное";
};
