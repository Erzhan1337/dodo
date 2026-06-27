import type { OrderStatus } from "./types";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { text: string; className: string }
> = {
  PENDING: {
    text: "Принят, ожидает оплаты",
    className: "bg-amber-100 text-amber-700",
  },
  SUCCEEDED: { text: "Оплачен", className: "bg-green-100 text-green-700" },
  CANCELED: { text: "Отменён", className: "bg-red-100 text-red-700" },
};
