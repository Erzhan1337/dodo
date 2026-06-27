export type OrderStatus = "PENDING" | "SUCCEEDED" | "CANCELED";

export interface OrderItemProductItem {
  id: string;
  size: number | null;
  pizzaType: number | null;
  product: {
    name: string;
    imageUrl: string;
  };
}

export interface OrderIngredient {
  id: string;
  name: string;
}

export type OrderCustomPizzaDetails = {
  type: "pizza-builder";
  version: number;
  name: string;
  format: "whole" | "halves";
  sauce: string;
  cheeseMode: "standard" | "double" | "none";
  bakeMode: string;
  sliceMode: string;
  unitPrice: number;
  ingredients: Array<{
    id: string;
    name: string;
    price: number;
    quantity: 1 | 2;
    placement: "whole" | "left" | "right";
    linePrice: number;
  }>;
  removedIngredients: Array<{
    id: string;
    name: string;
  }>;
};

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  customName: string | null;
  customDetails: OrderCustomPizzaDetails | null;
  productItem: OrderItemProductItem;
  ingredients: OrderIngredient[];
}

export interface Order {
  id: string;
  token: string;
  status: OrderStatus;
  totalPrice: number;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  comment: string | null;
  createdAt: string;
  items: OrderItem[];
}
