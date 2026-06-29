import type { OrderStatus, PaymentStatus } from "@/entities/order/model/types";
import type { UserRole } from "@/features/admin/model/types";
import { cn } from "@/shared/lib/utils";

const orderStyles: Record<OrderStatus, string> = {
  NEW: "bg-amber-100 text-amber-800",
  PREPARING: "bg-sky-100 text-sky-800",
  DELIVERING: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-red-100 text-red-800",
};

const orderLabels: Record<OrderStatus, string> = {
  NEW: "Новый",
  PREPARING: "Готовится",
  DELIVERING: "В доставке",
  COMPLETED: "Выполнен",
  CANCELED: "Отменён",
};

const paymentStyles: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SUCCEEDED: "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-zinc-100 text-zinc-700",
  FAILED: "bg-red-100 text-red-800",
};

const paymentLabels: Record<PaymentStatus, string> = {
  PENDING: "Ожидает оплаты",
  SUCCEEDED: "Оплачен",
  CANCELED: "Оплата отменена",
  FAILED: "Ошибка оплаты",
};

const roleStyles: Record<UserRole, string> = {
  ADMIN: "bg-indigo-100 text-indigo-800",
  CUSTOMER: "bg-zinc-100 text-zinc-700",
};

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Админ",
  CUSTOMER: "Клиент",
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <span
    className={cn(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
      orderStyles[status],
    )}
  >
    {orderLabels[status]}
  </span>
);

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <span
    className={cn(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
      paymentStyles[status],
    )}
  >
    {paymentLabels[status]}
  </span>
);

export const UserRoleBadge = ({ role }: { role: UserRole }) => (
  <span
    className={cn(
      "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
      roleStyles[role],
    )}
  >
    {roleLabels[role]}
  </span>
);
