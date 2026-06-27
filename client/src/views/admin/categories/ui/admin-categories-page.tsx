"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "@/features/admin/api/admin-api";
import { useAdminListState } from "@/features/admin/lib/use-admin-list-state";
import { AdminPagination } from "@/features/admin/ui/admin-pagination";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/features/admin/ui/admin-table";
import { AdminToolbar } from "@/features/admin/ui/admin-toolbar";
import { AdminModal } from "@/features/admin/ui/admin-modal";
import { ConfirmDialog } from "@/features/admin/ui/confirm-dialog";
import type { AdminCategory } from "@/features/admin/model/types";
import { useDebounce } from "@/shared/hooks";
import { Button } from "@/shared/ui";

export const AdminCategoriesPage = () => {
  const { params, setParams, setPage, setSort } = useAdminListState("id");
  const [search, setSearch] = useState(params.search ?? "");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const categoriesQuery = useAdminCategories(params);
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

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
    setName("");
    setIsFormOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditing(category);
    setName(category.name);
    setIsFormOpen(true);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, name: trimmedName },
        { onSuccess: () => setIsFormOpen(false) },
      );
      return;
    }

    createMutation.mutate(
      { name: trimmedName },
      { onSuccess: () => setIsFormOpen(false) },
    );
  };

  const columns = useMemo<AdminTableColumn<AdminCategory>[]>(
    () => [
      {
        id: "name",
        header: "Категория",
        sortKey: "name",
        cell: (category) => <span className="font-semibold">{category.name}</span>,
      },
      {
        id: "products",
        header: "Товары",
        sortKey: "products",
        cell: (category) => category._count.products,
      },
      {
        id: "id",
        header: "ID",
        sortKey: "id",
        cell: (category) => category.id,
      },
      {
        id: "actions",
        header: "",
        className: "w-28 text-right",
        cell: (category) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Редактировать категорию"
              onClick={() => openEdit(category)}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Удалить категорию"
              onClick={() => setDeleteTarget(category)}
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
        title="Категории"
        description="Группы товаров, используемые в каталоге и фильтрах."
        searchValue={search}
        searchPlaceholder="Найти категорию"
        onSearchChange={setSearch}
        actionLabel="Категория"
        onAction={openCreate}
      />
      <AdminTable
        columns={columns}
        rows={categoriesQuery.data?.data}
        rowKey={(category) => category.id}
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        emptyTitle="Категории не найдены"
        currentSortBy={params.sortBy}
        currentSortOrder={params.sortOrder}
        onSort={setSort}
        onRetry={() => void categoriesQuery.refetch()}
      />
      <AdminPagination meta={categoriesQuery.data?.meta} onPageChange={setPage} />

      <AdminModal
        title={editing ? "Редактировать категорию" : "Новая категория"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      >
        <form className="space-y-4 p-4" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold">
            Название
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <div className="flex justify-end gap-2">
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
        title="Удалить категорию?"
        description="Категорию нельзя будет восстановить. Если в ней есть товары, сервер отклонит удаление."
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
