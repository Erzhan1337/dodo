"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Eye, Radio, RadioTower, Trash2 } from "lucide-react";
import {
  useAdminOrder,
  useAdminOrders,
  useDeleteAdminOrder,
  useUpdateAdminOrderStatus,
} from "@/features/admin/api/admin-api";
import { useAdminOrdersRealtime } from "@/features/admin/api/use-admin-orders-realtime";
import { useAdminListState } from "@/features/admin/lib/use-admin-list-state";
import { formatDate, formatMoney } from "@/features/admin/lib/format";
import { AdminPagination } from "@/features/admin/ui/admin-pagination";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/features/admin/ui/admin-table";
import { AdminToolbar } from "@/features/admin/ui/admin-toolbar";
import { AdminModal } from "@/features/admin/ui/admin-modal";
import { ConfirmDialog } from "@/features/admin/ui/confirm-dialog";
import { OrderStatusBadge } from "@/features/admin/ui/status-badge";
import type { AdminOrder } from "@/features/admin/model/types";
import type { OrderStatus } from "@/entities/order/model/types";
import { useDebounce } from "@/shared/hooks";
import { Button, Skeleton } from "@/shared/ui";

const orderFilterKeys = ["status"] as const;
const statuses: OrderStatus[] = ["PENDING", "SUCCEEDED", "CANCELED"];

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Ожидает",
  SUCCEEDED: "Выполнен",
  CANCELED: "Отменён",
};

const formatOrderNumber = (value: number) => String(value).padStart(6, "0");

export const AdminOrdersPage = () => {
  const { params, setParams, setPage, setSort } = useAdminListState(
    "createdAt",
    [...orderFilterKeys],
  );
  const [search, setSearch] = useState(params.search ?? "");
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const ordersQuery = useAdminOrders(params);
  const orderDetailsQuery = useAdminOrder(selectedOrderId);
  const updateStatusMutation = useUpdateAdminOrderStatus();
  const deleteMutation = useDeleteAdminOrder();
  const realtimeState = useAdminOrdersRealtime();

  useEffect(() => {
    if ((params.search ?? "") !== debouncedSearch) {
      setParams({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, params.search, setParams]);

  useEffect(() => {
    setSearch(params.search ?? "");
  }, [params.search]);

  const columns = useMemo<AdminTableColumn<AdminOrder>[]>(
    () => [
      {
        id: "order",
        header: "Заказ",
        cell: (order) => (
          <div>
            <div className="font-semibold">
              #{formatOrderNumber(order.orderNumber)}
            </div>
            <div className="text-xs text-muted-foreground">
              {order.token.slice(0, 8)}
            </div>
          </div>
        ),
      },
      {
        id: "name",
        header: "Клиент",
        sortKey: "name",
        cell: (order) => (
          <div>
            <div className="font-semibold">{order.name}</div>
            <div className="text-xs text-muted-foreground">{order.phone}</div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Статус",
        sortKey: "status",
        cell: (order) => (
          <select
            value={order.status}
            disabled={updateStatusMutation.isPending}
            onChange={(event) =>
              updateStatusMutation.mutate({
                id: order.id,
                status: event.target.value as OrderStatus,
              })
            }
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            aria-label="Изменить статус заказа"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "totalPrice",
        header: "Сумма",
        sortKey: "totalPrice",
        cell: (order) => formatMoney(order.totalPrice),
      },
      {
        id: "items",
        header: "Позиций",
        cell: (order) => order._count.items,
      },
      {
        id: "createdAt",
        header: "Создан",
        sortKey: "createdAt",
        cell: (order) => formatDate(order.createdAt),
      },
      {
        id: "actions",
        header: "",
        className: "w-28 text-right",
        cell: (order) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Открыть заказ"
              onClick={() => setSelectedOrderId(order.id)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Удалить заказ"
              onClick={() => setDeleteTarget(order)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [updateStatusMutation],
  );

  const details = orderDetailsQuery.data;

  return (
    <section>
      <AdminToolbar
        title="Заказы"
        description="Просмотр заказов, изменение статусов и контроль выручки."
        searchValue={search}
        searchPlaceholder="Клиент, телефон, адрес, токен"
        onSearchChange={setSearch}
      >
        <div className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold text-muted-foreground">
          {realtimeState === "connected" ? (
            <>
              <RadioTower className="size-4 text-green-600" />
              Live
            </>
          ) : (
            <>
              <Radio className="size-4 text-amber-600" />
              Sync
            </>
          )}
        </div>
        <select
          value={params.status ?? ""}
          onChange={(event) =>
            setParams({
              status: event.target.value
                ? (event.target.value as OrderStatus)
                : undefined,
            })
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Фильтр по статусу"
        >
          <option value="">Все статусы</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </AdminToolbar>
      <AdminTable
        columns={columns}
        rows={ordersQuery.data?.data}
        rowKey={(order) => order.id}
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        emptyTitle="Заказы не найдены"
        currentSortBy={params.sortBy}
        currentSortOrder={params.sortOrder}
        onSort={setSort}
        onRetry={() => void ordersQuery.refetch()}
      />
      <AdminPagination meta={ordersQuery.data?.meta} onPageChange={setPage} />

      <AdminModal
        title={
          details ? `Заказ #${formatOrderNumber(details.orderNumber)}` : "Заказ"
        }
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(undefined)}
        size="lg"
      >
        {orderDetailsQuery.isLoading && (
          <div className="space-y-3 p-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        )}
        {details && (
          <div className="space-y-5 p-4">
            <div className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Клиент
                </p>
                <p className="mt-1 font-semibold">{details.name}</p>
                <p className="text-sm text-muted-foreground">{details.phone}</p>
                {details.email && (
                  <p className="text-sm text-muted-foreground">{details.email}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Статус
                </p>
                <div className="mt-2">
                  <OrderStatusBadge status={details.status} />
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {formatMoney(details.totalPrice)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Адрес
                </p>
                <p className="mt-1 text-sm">{details.address}</p>
                {details.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {details.comment}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {details.items.map((item) => {
                const title = item.customName ?? item.productItem.product.name;
                return (
                  <article
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={item.productItem.product.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.productItem.size
                              ? `${item.productItem.size} см`
                              : "Без размера"}
                            {item.productItem.pizzaType
                              ? `, тип ${item.productItem.pizzaType}`
                              : ""}
                          </p>
                        </div>
                        <p className="font-bold">
                          {item.quantity} x {formatMoney(item.price)}
                        </p>
                      </div>
                      {item.ingredients.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.ingredients
                            .map((ingredient) => ingredient.name)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Удалить заказ?"
        description="Заказ и его позиции будут удалены без возможности восстановления."
        isPending={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </section>
  );
};
