import type { Order, OrderStatus, PaymentStatus } from "./types";

type StatusMeta = { text: string; className: string };

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  NEW: {
    text: "Новый",
    className: "bg-amber-100 text-amber-700",
  },
  PREPARING: {
    text: "Готовится",
    className: "bg-sky-100 text-sky-700",
  },
  DELIVERING: {
    text: "В доставке",
    className: "bg-indigo-100 text-indigo-700",
  },
  COMPLETED: { text: "Выполнен", className: "bg-green-100 text-green-700" },
  CANCELED: { text: "Отменён", className: "bg-red-100 text-red-700" },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING: {
    text: "Ожидает оплаты",
    className: "bg-amber-100 text-amber-700",
  },
  SUCCEEDED: {
    text: "Оплачен",
    className: "bg-emerald-100 text-emerald-700",
  },
  CANCELED: {
    text: "Оплата отменена",
    className: "bg-zinc-100 text-zinc-700",
  },
  FAILED: {
    text: "Оплата не прошла",
    className: "bg-red-100 text-red-700",
  },
};

export const getOrderDisplayStatus = (
  order: Pick<Order, "status" | "payment">,
) => {
  if (order.status === "NEW" && order.payment?.status !== "SUCCEEDED") {
    return order.payment
      ? PAYMENT_STATUS_META[order.payment.status]
      : PAYMENT_STATUS_META.PENDING;
  }

  return ORDER_STATUS_META[order.status];
};

export const canPayOrder = (order: Pick<Order, "status" | "payment">) =>
  order.status === "NEW" && order.payment?.status !== "SUCCEEDED";
