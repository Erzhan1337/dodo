"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/features/admin/api/admin-api";
import { useAdminListState } from "@/features/admin/lib/use-admin-list-state";
import { formatDate } from "@/features/admin/lib/format";
import { AdminPagination } from "@/features/admin/ui/admin-pagination";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/features/admin/ui/admin-table";
import { AdminToolbar } from "@/features/admin/ui/admin-toolbar";
import { AdminModal } from "@/features/admin/ui/admin-modal";
import { ConfirmDialog } from "@/features/admin/ui/confirm-dialog";
import { UserRoleBadge } from "@/features/admin/ui/status-badge";
import type { AdminUser, UserRole } from "@/features/admin/model/types";
import { useDebounce } from "@/shared/hooks";
import { Button } from "@/shared/ui";

const userFilterKeys = ["role"] as const;

type FormState = {
  name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  role: UserRole;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  password: "",
  address: "",
  role: "CUSTOMER",
};

export const AdminUsersPage = () => {
  const { params, setParams, setPage, setSort } = useAdminListState(
    "createdAt",
    [...userFilterKeys],
  );
  const [search, setSearch] = useState(params.search ?? "");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const debouncedSearch = useDebounce(search, 350);

  const usersQuery = useAdminUsers(params);
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

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

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({
      name: user.name,
      phone: user.phone,
      email: user.email ?? "",
      password: "",
      address: user.address ?? "",
      role: user.role,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      password: form.password || undefined,
      address: form.address.trim() || null,
      role: form.role,
    };

    if (!payload.name || !payload.phone) return;

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setIsFormOpen(false) },
      );
      return;
    }

    if (!form.password) return;
    createMutation.mutate(
      { ...payload, password: form.password },
      { onSuccess: () => setIsFormOpen(false) },
    );
  };

  const columns = useMemo<AdminTableColumn<AdminUser>[]>(
    () => [
      {
        id: "name",
        header: "Пользователь",
        sortKey: "name",
        cell: (user) => (
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.phone}</div>
          </div>
        ),
      },
      {
        id: "email",
        header: "Email",
        sortKey: "email",
        cell: (user) => user.email || "—",
      },
      {
        id: "role",
        header: "Роль",
        sortKey: "role",
        cell: (user) => <UserRoleBadge role={user.role} />,
      },
      {
        id: "orders",
        header: "Заказы",
        cell: (user) => user._count.orders,
      },
      {
        id: "createdAt",
        header: "Создан",
        sortKey: "createdAt",
        cell: (user) => formatDate(user.createdAt),
      },
      {
        id: "actions",
        header: "",
        className: "w-28 text-right",
        cell: (user) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Редактировать пользователя"
              onClick={() => openEdit(user)}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Удалить пользователя"
              onClick={() => setDeleteTarget(user)}
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
        title="Пользователи"
        description="Клиенты и администраторы с серверной проверкой ролей."
        searchValue={search}
        searchPlaceholder="Имя, телефон, email"
        onSearchChange={setSearch}
        actionLabel="Пользователь"
        onAction={openCreate}
      >
        <select
          value={params.role ?? ""}
          onChange={(event) =>
            setParams({
              role: event.target.value ? (event.target.value as UserRole) : undefined,
            })
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Фильтр по роли"
        >
          <option value="">Все роли</option>
          <option value="ADMIN">Админы</option>
          <option value="CUSTOMER">Клиенты</option>
        </select>
      </AdminToolbar>
      <AdminTable
        columns={columns}
        rows={usersQuery.data?.data}
        rowKey={(user) => user.id}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        emptyTitle="Пользователи не найдены"
        currentSortBy={params.sortBy}
        currentSortOrder={params.sortOrder}
        onSort={setSort}
        onRetry={() => void usersQuery.refetch()}
      />
      <AdminPagination meta={usersQuery.data?.meta} onPageChange={setPage} />

      <AdminModal
        title={editing ? "Редактировать пользователя" : "Новый пользователь"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        size="lg"
      >
        <form className="grid gap-4 p-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold">
            Имя
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
            Телефон
            <input
              required
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="block text-sm font-semibold">
            Роль
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as UserRole,
                }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="CUSTOMER">Клиент</option>
              <option value="ADMIN">Админ</option>
            </select>
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            Адрес
            <input
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">
            {editing ? "Новый пароль" : "Пароль"}
            <input
              required={!editing}
              minLength={8}
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
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
        title="Удалить пользователя?"
        description="Профиль будет удалён, а связанные заказы останутся без пользователя."
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
