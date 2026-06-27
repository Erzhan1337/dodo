import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchOrder } from "@/entities/order";
import { OrderPage } from "@/views/order";

export const metadata: Metadata = {
  title: "Ваш заказ | Dodo Pizza",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Order({ params }: PageProps) {
  const { token } = await params;
  const order = await fetchOrder(token);

  if (!order) {
    notFound();
  }

  return <OrderPage order={order} />;
}
