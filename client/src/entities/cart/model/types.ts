export interface CartProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CartProductItem {
  id: string;
  price: number;
  size: number | null;
  pizzaType: number | null;
  product: CartProduct;
}

export interface CartIngredient {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export type CustomPizzaPlacement = "whole" | "left" | "right";
export type CustomPizzaFormat = "whole" | "halves";
export type CustomPizzaCheeseMode = "standard" | "double" | "none";

export interface CustomPizzaDetails {
  type: "pizza-builder";
  version: number;
  name: string;
  format: CustomPizzaFormat;
  sauce: string;
  cheeseMode: CustomPizzaCheeseMode;
  bakeMode: string;
  sliceMode: string;
  unitPrice: number;
  ingredients: Array<{
    id: string;
    name: string;
    price: number;
    quantity: 1 | 2;
    placement: CustomPizzaPlacement;
    linePrice: number;
  }>;
  removedIngredients: Array<{
    id: string;
    name: string;
  }>;
}

export interface CartItem {
  id: string;
  quantity: number;
  customName: string | null;
  customDetails: CustomPizzaDetails | null;
  customUnitPrice: number | null;
  productItem: CartProductItem;
  ingredients: CartIngredient[];
}

export interface CartResponse {
  id: string;
  totalPrice: number;
  totalAmount: number;
  items: CartItem[];
  token?: string;
}

export interface CreateCartItemValues {
  productItemId: string;
  ingredients?: string[];
  customPizza?: {
    name?: string;
    format: CustomPizzaFormat;
    sauce: string;
    cheeseMode: CustomPizzaCheeseMode;
    bakeMode?: string;
    sliceMode?: string;
    ingredients: Array<{
      id: string;
      quantity: 1 | 2;
      placement: CustomPizzaPlacement;
    }>;
    removedIngredientIds?: string[];
  };
}
