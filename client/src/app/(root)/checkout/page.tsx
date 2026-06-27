import type { Metadata } from "next";
import { CheckoutPage } from "@/views/checkout";

export const metadata: Metadata = {
  title: "Оформление заказа | Dodo Pizza",
};

export default function Checkout() {
  return <CheckoutPage />;
}
