"use client";

import dynamic from "next/dynamic";
import {
  AlertCircle,
  Banknote,
  Clock3,
  Package,
  ReceiptText,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useAdminDashboard } from "@/features/admin/api/admin-api";
import { formatMoney } from "@/features/admin/lib/format";
import { OrderStatusBadge } from "@/features/admin/ui/status-badge";
import { Button, Skeleton } from "@/shared/ui";

const RevenueChart = dynamic(
  () =>
    import("./admin-revenue-chart").then((module) => module.AdminRevenueChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 rounded-lg" />,
  },
);

const metricCards = [
  { key: "totalRevenue", label: "Выручка", icon: Banknote, format: formatMoney },
  { key: "todayRevenue", label: "Выручка сегодня", icon: ShoppingBag, format: formatMoney },
  { key: "ordersTotal", label: "Заказы", icon: ReceiptText },
  { key: "ordersToday", label: "Заказы сегодня", icon: Clock3 },
  { key: "pendingOrders", label: "Новые", icon: AlertCircle },
  { key: "productsTotal", label: "Товары", icon: Package },
  { key: "usersTotal", label: "Пользователи", icon: Users },
  { key: "averageOrderValue", label: "Средний чек", icon: Banknote, format: formatMoney },
] as const;

export const AdminDashboardPage = () => {
  const { data, isLoading, isError, isFetching, refetch } = useAdminDashboard();

  if (isError) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <h1 className="mt-3 text-2xl font-extrabold">Dashboard недоступен</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Проверьте сервер и повторите запрос.
        </p>
        <Button
          type="button"
          className="mt-5"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? "Загрузка..." : "Повторить"}
        </Button>
      </div>
    );
  }

  return (
    <section>
      <div className="border-b border-border p-4">
        <h1 className="text-xl font-extrabold md:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Операционные показатели заказов, каталога и клиентов.
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const value = data?.metrics[card.key] ?? 0;
          return (
            <article
              key={card.key}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  {card.label}
                </span>
                <Icon className="size-4 text-primary" />
              </div>
              {isLoading ? (
                <Skeleton className="mt-4 h-8 w-28 rounded-md" />
              ) : (
                <strong className="mt-3 block text-2xl font-extrabold">
                  {"format" in card && card.format ? card.format(value) : value}
                </strong>
              )}
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">Выручка за 14 дней</h2>
              <p className="text-sm text-muted-foreground">
                Учитываются только подтверждённые оплаты.
              </p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-72 rounded-lg" />
          ) : data?.revenueByDay.length ? (
            <RevenueChart data={data.revenueByDay} />
          ) : (
            <div className="flex h-72 items-center justify-center text-muted-foreground">
              Заказов пока нет
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-extrabold">Статусы заказов</h2>
          <div className="mt-4 space-y-3">
            {isLoading &&
              Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-10 rounded-md" />
              ))}
            {!isLoading &&
              data?.statusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <OrderStatusBadge status={item.status} />
                  <span className="text-sm font-bold">{item.count}</span>
                </div>
              ))}
            {!isLoading && data?.statusBreakdown.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Заказов пока нет
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="p-4 pt-0">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="font-extrabold">Топ товаров по заказам</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="border-b border-border py-2 pr-4">Товар</th>
                  <th className="border-b border-border py-2 pr-4">Кол-во</th>
                  <th className="border-b border-border py-2">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 4 }, (_, index) => (
                    <tr key={index}>
                      <td className="py-3 pr-4">
                        <Skeleton className="h-5 w-44 rounded-md" />
                      </td>
                      <td className="py-3 pr-4">
                        <Skeleton className="h-5 w-14 rounded-md" />
                      </td>
                      <td className="py-3">
                        <Skeleton className="h-5 w-24 rounded-md" />
                      </td>
                    </tr>
                  ))}
                {!isLoading &&
                  data?.topProducts.map((product) => (
                    <tr key={product.productId}>
                      <td className="border-b border-border py-3 pr-4 font-semibold">
                        {product.name}
                      </td>
                      <td className="border-b border-border py-3 pr-4">
                        {product.quantity}
                      </td>
                      <td className="border-b border-border py-3">
                        {formatMoney(product.revenue)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && data?.topProducts.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Недостаточно данных
              </p>
            )}
          </div>
        </div>
      </section>
    </section>
  );
};
