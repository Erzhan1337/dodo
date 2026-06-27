import type { OrderStatus } from "@/entities/order/model/types";
import type { UserRole } from "@/features/admin/model/types";
import { cn } from "@/shared/lib/utils";

const orderStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SUCCEEDED:
    "bg-emerald-100 text-emerald-800",
  CANCELED: "bg-red-100 text-red-800",
};

const orderLabels: Record<OrderStatus, string> = {
  PENDING: "Ожидает",
  SUCCEEDED: "Выполнен",
  CANCELED: "Отменён",
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
