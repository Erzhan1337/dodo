"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Edit3, Trash2 } from "lucide-react";
import {
  useAdminIngredients,
  useCreateAdminIngredient,
  useDeleteAdminIngredient,
  useUpdateAdminIngredient,
} from "@/features/admin/api/admin-api";
import { useAdminListState } from "@/features/admin/lib/use-admin-list-state";
import { formatMoney } from "@/features/admin/lib/format";
import { AdminPagination } from "@/features/admin/ui/admin-pagination";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/features/admin/ui/admin-table";
import { AdminToolbar } from "@/features/admin/ui/admin-toolbar";
import { AdminModal } from "@/features/admin/ui/admin-modal";
import { ConfirmDialog } from "@/features/admin/ui/confirm-dialog";
import type { AdminIngredient } from "@/features/admin/model/types";
import { useDebounce } from "@/shared/hooks";
import { Button } from "@/shared/ui";

type FormState = {
  name: string;
  price: string;
  imageUrl: string;
};

const emptyForm: FormState = { name: "", price: "0", imageUrl: "" };

export const AdminIngredientsPage = () => {
  const { params, setParams, setPage, setSort } = useAdminListState("name");
  const [search, setSearch] = useState(params.search ?? "");
  const [editing, setEditing] = useState<AdminIngredient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminIngredient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const debouncedSearch = useDebounce(search, 350);

  const ingredientsQuery = useAdminIngredients(params);
  const createMutation = useCreateAdminIngredient();
  const updateMutation = useUpdateAdminIngredient();
  const deleteMutation = useDeleteAdminIngredient();

  useEffect(() => {
    if ((params.search ?? "") !== debouncedSearch) {
      setParams({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, params.search, setParams]);

  useEffect(() => {
    setSearch(params.search ?? "");
  }, [params.search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (ingredient: AdminIngredient) => {
    setEditing(ingredient);
    setForm({
      name: ingredient.name,
      price: String(ingredient.price),
      imageUrl: ingredient.imageUrl,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
    };
    if (!payload.name || !payload.imageUrl || !Number.isFinite(payload.price)) return;

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setIsFormOpen(false) },
      );
      return;
    }

    createMutation.mutate(payload, { onSuccess: () => setIsFormOpen(false) });
  };

  const columns = useMemo<AdminTableColumn<AdminIngredient>[]>(
    () => [
      {
        id: "name",
        header: "Ингредиент",
        sortKey: "name",
        cell: (ingredient) => (
          <div className="flex items-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src={ingredient.imageUrl}
                alt=""
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </div>
            <span className="font-semibold">{ingredient.name}</span>
          </div>
        ),
      },
      {
        id: "price",
        header: "Цена",
        sortKey: "price",
        cell: (ingredient) => formatMoney(ingredient.price),
      },
      {
        id: "products",
        header: "В товарах",
        sortKey: "products",
        cell: (ingredient) => ingredient._count?.products ?? 0,
      },
      {
        id: "actions",
        header: "",
        className: "w-28 text-right",
        cell: (ingredient) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Редактировать ингредиент"
              onClick={() => openEdit(ingredient)}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Удалить ингредиент"
              onClick={() => setDeleteTarget(ingredient)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <section>
      <AdminToolbar
        title="Ингредиенты"
        description="Добавки, цены и изображения для карточек и конструктора."
        searchValue={search}
        searchPlaceholder="Найти ингредиент"
        onSearchChange={setSearch}
        actionLabel="Ингредиент"
        onAction={openCreate}
      />
      <AdminTable
        columns={columns}
        rows={ingredientsQuery.data?.data}
        rowKey={(ingredient) => ingredient.id}
        isLoading={ingredientsQuery.isLoading}
        isError={ingredientsQuery.isError}
        emptyTitle="Ингредиенты не найдены"
        currentSortBy={params.sortBy}
        currentSortOrder={params.sortOrder}
        onSort={setSort}
        onRetry={() => void ingredientsQuery.refetch()}
      />
      <AdminPagination meta={ingredientsQuery.data?.meta} onPageChange={setPage} />

      <AdminModal
        title={editing ? "Редактировать ингредиент" : "Новый ингредиент"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      >
        <form className="grid gap-4 p-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold">
            Название
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="block text-sm font-semibold">
            Цена
            <input
              required
              min={0}
              type="number"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            URL изображения
            <input
              required
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Сохранение..."
                : "Сохранить"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Удалить ингредиент?"
        description="Удаление возможно только если ингредиент не используется в товарах, корзинах или заказах."
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
