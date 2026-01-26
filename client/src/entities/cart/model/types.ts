// НИКАКИХ ИМПОРТОВ ИЗ ДРУГИХ СЛАЙСОВ
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

export interface CartItem {
  id: string;
  quantity: number;
  productItem: CartProductItem;
  ingredients: CartIngredient[];
}

export interface CartResponse {
  id: string;
  totalAmount: number;
  items: CartItem[];
  token?: string;
}

export interface CreateCartItemValues {
  productItemId: string;
  ingredients?: string[];
}
