export type OrderStatus = "PENDING" | "SUCCEEDED" | "CANCELED";

export interface OrderItemProductItem {
  id: string;
  size: number | null;
  pizzaType: number | null;
  product: {
    id: string;
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
  halfAndHalf?: {
    leftProduct: OrderCustomPizzaHalfProduct;
    rightProduct: OrderCustomPizzaHalfProduct;
    baseUnitPrice: number;
  } | null;
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

export type OrderCustomPizzaHalfProduct = {
  productId: string;
  productItemId: string;
  name: string;
  imageUrl: string;
  price: number;
  size: number | null;
  pizzaType: number | null;
};

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  customName: string | null;
  customDetails: OrderCustomPizzaDetails | null;
  productItem: OrderItemProductItem;
  ingredients: OrderIngredient[];
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  token: string;
  status: OrderStatus;
  totalPrice: number;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
