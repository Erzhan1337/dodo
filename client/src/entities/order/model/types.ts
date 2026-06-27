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

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
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
