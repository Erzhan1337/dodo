import type { CartResponse } from "./types";

export const CART_QUERY_KEY = ["cart"] as const;
export const ANONYMOUS_CART_QUERY_KEY = "anonymous";

export const getCartQueryKey = (userId: string | null | undefined) => [
  ...CART_QUERY_KEY,
  userId ?? ANONYMOUS_CART_QUERY_KEY,
];

export const EMPTY_CART_RESPONSE: CartResponse = {
  id: "",
  subtotalPrice: 0,
  discountAmount: 0,
  totalPrice: 0,
  totalAmount: 0,
  promoCodeId: null,
  promoCode: null,
  items: [],
};
