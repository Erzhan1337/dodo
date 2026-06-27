"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  useAdminReviews,
  useDeleteAdminReview,
} from "@/features/admin/api/admin-api";
import { useAdminListState } from "@/features/admin/lib/use-admin-list-state";
import { formatDate } from "@/features/admin/lib/format";
import { AdminPagination } from "@/features/admin/ui/admin-pagination";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/features/admin/ui/admin-table";
import { AdminToolbar } from "@/features/admin/ui/admin-toolbar";
import { ConfirmDialog } from "@/features/admin/ui/confirm-dialog";
import type { AdminReview } from "@/features/admin/model/types";
import { RatingStars } from "@/entities/review";
import { useDebounce } from "@/shared/hooks";
import { Button } from "@/shared/ui";

const reviewFilterKeys = ["rating"] as const;

export const AdminReviewsPage = () => {
  const { params, setParams, setPage, setSort } = useAdminListState(
    "createdAt",
    [...reviewFilterKeys],
  );
  const [search, setSearch] = useState(params.search ?? "");
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const reviewsQuery = useAdminReviews(params);
  const deleteMutation = useDeleteAdminReview();

  useEffect(() => {
    if ((params.search ?? "") !== debouncedSearch) {
      setParams({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, params.search, setParams]);

  useEffect(() => {
    setSearch(params.search ?? "");
  }, [params.search]);

  const columns = useMemo<AdminTableColumn<AdminReview>[]>(
    () => [
      {
        id: "product",
        header: "Товар",
        sortKey: "product",
        cell: (review) => (
          <div className="flex min-w-56 items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src={review.product.imageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="font-semibold">{review.product.name}</div>
              <div className="text-xs text-muted-foreground">
                {review.product.id.slice(-6)}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "user",
        header: "Клиент",
        sortKey: "user",
        cell: (review) => (
          <div>
            <div className="font-semibold">{review.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {review.user.id.slice(-6)}
            </div>
          </div>
        ),
      },
      {
        id: "rating",
        header: "Оценка",
        sortKey: "rating",
        cell: (review) => (
          <div className="flex items-center gap-2">
            <RatingStars value={review.rating} iconClassName="size-3.5" />
            <span className="font-bold">{review.rating}</span>
          </div>
        ),
      },
      {
        id: "comment",
        header: "Комментарий",
        cell: (review) => (
          <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
            {review.comment || "Без комментария"}
          </p>
        ),
      },
      {
        id: "createdAt",
        header: "Создан",
        sortKey: "createdAt",
        cell: (review) => formatDate(review.createdAt),
      },
      {
        id: "actions",
        header: "",
        className: "w-20 text-right",
        cell: (review) => (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Удалить отзыв"
            onClick={() => setDeleteTarget(review)}
          >
            <Trash2 className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <section>
      <AdminToolbar
        title="Отзывы"
        description="Модерация пользовательских оценок и комментариев к товарам."
        searchValue={search}
        searchPlaceholder="Товар, клиент или комментарий"
        onSearchChange={setSearch}
      >
        <select
          value={params.rating ?? ""}
          onChange={(event) =>
            setParams({
              rating: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Фильтр по оценке"
        >
          <option value="">Все оценки</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} звёзд
            </option>
          ))}
        </select>
      </AdminToolbar>
      <AdminTable
        columns={columns}
        rows={reviewsQuery.data?.data}
        rowKey={(review) => review.id}
        isLoading={reviewsQuery.isLoading}
        isError={reviewsQuery.isError}
        emptyTitle="Отзывы не найдены"
        currentSortBy={params.sortBy}
        currentSortOrder={params.sortOrder}
        onSort={setSort}
        onRetry={() => void reviewsQuery.refetch()}
      />
      <AdminPagination meta={reviewsQuery.data?.meta} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Удалить отзыв?"
        description="Отзыв исчезнет из карточки товара, а средний рейтинг будет пересчитан."
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
