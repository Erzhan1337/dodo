import type { Metadata } from "next";
import { OrdersPage } from "@/views/orders";

export const metadata: Metadata = {
  title: "Заказы | Dodo Pizza",
};

export default function Orders() {
  return <OrdersPage />;
}
