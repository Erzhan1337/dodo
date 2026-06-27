"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Edit3, Plus, Trash2 } from "lucide-react";
import {
  useAdminCategories,
  useAdminIngredients,
  useAdminProducts,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
} from "@/features/admin/api/admin-api";
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
import type {
  AdminProduct,
  AdminProductItem,
  AdminProductPayload,
} from "@/features/admin/model/types";
import { useDebounce } from "@/shared/hooks";
import { Button, Skeleton } from "@/shared/ui";

const productFilterKeys = ["categoryId"] as const;

type ItemForm = {
  id?: string;
  price: string;
  size: string;
  pizzaType: string;
  imageUrl: string;
};

type ProductForm = {
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  canBuildHalfAndHalf: boolean;
  ingredientIds: string[];
  items: ItemForm[];
};

const emptyItem: ItemForm = {
  price: "0",
  size: "",
  pizzaType: "",
  imageUrl: "",
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  imageUrl: "",
  categoryId: "",
  canBuildHalfAndHalf: false,
  ingredientIds: [],
  items: [{ ...emptyItem }],
};

const toItemForm = (item: AdminProductItem): ItemForm => ({
  id: item.id,
  price: String(item.price),
  size: item.size ? String(item.size) : "",
  pizzaType: item.pizzaType ? String(item.pizzaType) : "",
  imageUrl: item.imageUrl,
});

const toProductForm = (product: AdminProduct): ProductForm => ({
  name: product.name,
  description: product.description,
  imageUrl: product.imageUrl,
  categoryId: String(product.categoryId),
  canBuildHalfAndHalf: product.canBuildHalfAndHalf,
  ingredientIds: product.ingredients.map((ingredient) => ingredient.id),
  items: product.items.map(toItemForm),
});

export const AdminProductsPage = () => {
  const { params, setParams, setPage, setSort } = useAdminListState(
    "createdAt",
    [...productFilterKeys],
  );
  const [search, setSearch] = useState(params.search ?? "");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const debouncedSearch = useDebounce(search, 350);

  const productsQuery = useAdminProducts(params);
  const categoriesQuery = useAdminCategories({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const ingredientsQuery = useAdminIngredients({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct();
  const deleteMutation = useDeleteAdminProduct();

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
    setForm({
      ...emptyForm,
      categoryId: categoriesQuery.data?.data[0]?.id
        ? String(categoriesQuery.data.data[0].id)
        : "",
    });
    setIsFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditing(product);
    setForm(toProductForm(product));
    setIsFormOpen(true);
  };

  const setItem = (index: number, patch: Partial<ItemForm>) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeItem = (index: number) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const toggleIngredient = (ingredientId: string) => {
    setForm((current) => {
      const exists = current.ingredientIds.includes(ingredientId);
      return {
        ...current,
        ingredientIds: exists
          ? current.ingredientIds.filter((id) => id !== ingredientId)
          : [...current.ingredientIds, ingredientId],
      };
    });
  };

  const buildPayload = (): AdminProductPayload | null => {
    const categoryId = Number(form.categoryId);
    if (!form.name.trim() || !form.imageUrl.trim() || !Number.isFinite(categoryId)) {
      return null;
    }

    const items = form.items
      .map((item) => ({
        id: item.id,
        price: Number(item.price),
        size: item.size ? Number(item.size) : null,
        pizzaType: item.pizzaType ? Number(item.pizzaType) : null,
        imageUrl: item.imageUrl.trim(),
      }))
      .filter((item) => item.price > 0 && item.imageUrl);

    if (items.length === 0) return null;

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      categoryId,
      canBuildHalfAndHalf: form.canBuildHalfAndHalf,
      ingredientIds: form.ingredientIds,
      items,
    };
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = buildPayload();
    if (!payload) return;

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setIsFormOpen(false) },
      );
      return;
    }

    createMutation.mutate(payload, { onSuccess: () => setIsFormOpen(false) });
  };

  const columns = useMemo<AdminTableColumn<AdminProduct>[]>(
    () => [
      {
        id: "name",
        header: "Товар",
        sortKey: "name",
        cell: (product) => (
          <div className="flex min-w-64 items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted">
              <Image
                src={product.imageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="font-semibold">{product.name}</div>
              <div className="line-clamp-1 max-w-80 text-xs text-muted-foreground">
                {product.description}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "category",
        header: "Категория",
        sortKey: "category",
        cell: (product) => product.category.name,
      },
      {
        id: "price",
        header: "Цена",
        sortKey: "minPrice",
        cell: (product) =>
          product.minPrice === null
            ? "—"
            : product.minPrice === product.maxPrice
              ? formatMoney(product.minPrice)
              : `${formatMoney(product.minPrice)} - ${formatMoney(product.maxPrice ?? product.minPrice)}`,
      },
      {
        id: "variants",
        header: "Варианты",
        cell: (product) => product.items.length,
      },
      {
        id: "updated",
        header: "Обновлён",
        sortKey: "updatedAt",
        cell: (product) => formatDate(product.updatedAt),
      },
      {
        id: "actions",
        header: "",
        className: "w-28 text-right",
        cell: (product) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Редактировать товар"
              onClick={() => openEdit(product)}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Удалить товар"
              onClick={() => setDeleteTarget(product)}
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
        title="Товары"
        description="Пиццы, варианты размера/теста и состав ингредиентов."
        searchValue={search}
        searchPlaceholder="Название или описание"
        onSearchChange={setSearch}
        actionLabel="Товар"
        onAction={openCreate}
      >
        <select
          value={params.categoryId ?? ""}
          onChange={(event) =>
            setParams({
              categoryId: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Фильтр по категории"
        >
          <option value="">Все категории</option>
          {categoriesQuery.data?.data.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </AdminToolbar>
      <AdminTable
        columns={columns}
        rows={productsQuery.data?.data}
        rowKey={(product) => product.id}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        emptyTitle="Товары не найдены"
        currentSortBy={params.sortBy}
        currentSortOrder={params.sortOrder}
        onSort={setSort}
        onRetry={() => void productsQuery.refetch()}
      />
      <AdminPagination meta={productsQuery.data?.meta} onPageChange={setPage} />

      <AdminModal
        title={editing ? "Редактировать товар" : "Новый товар"}
        description="Изменение или удаление вариантов, уже попавших в заказы, будет заблокировано сервером."
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        size="xl"
      >
        <form className="space-y-5 p-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">
              Название
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="block text-sm font-semibold">
              Категория
              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="" disabled>
                  Выберите категорию
                </option>
                {categoriesQuery.data?.data.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold md:col-span-2">
              URL изображения товара
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
            <label className="block text-sm font-semibold md:col-span-2">
              Описание
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
              <input
                type="checkbox"
                checked={form.canBuildHalfAndHalf}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    canBuildHalfAndHalf: event.target.checked,
                  }))
                }
                className="size-4 accent-primary"
              />
              Доступна для половинок в конструкторе
            </label>
          </div>

          <section>
            <h3 className="text-sm font-extrabold">Ингредиенты</h3>
            {ingredientsQuery.isLoading ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-9 rounded-md" />
                ))}
              </div>
            ) : (
              <div className="mt-2 grid max-h-52 gap-2 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-2 lg:grid-cols-3">
                {ingredientsQuery.data?.data.map((ingredient) => (
                  <label
                    key={ingredient.id}
                    className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={form.ingredientIds.includes(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="size-4 accent-primary"
                    />
                    <span className="truncate">{ingredient.name}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold">Варианты</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    items: [...current.items, { ...emptyItem }],
                  }))
                }
              >
                <Plus className="size-4" />
                Вариант
              </Button>
            </div>
            <div className="mt-2 space-y-3">
              {form.items.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[100px_100px_100px_1fr_36px]"
                >
                  <label className="block text-xs font-semibold">
                    Цена
                    <input
                      required
                      min={1}
                      type="number"
                      value={item.price}
                      onChange={(event) =>
                        setItem(index, { price: event.target.value })
                      }
                      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 outline-none focus:border-ring"
                    />
                  </label>
                  <label className="block text-xs font-semibold">
                    Размер
                    <input
                      type="number"
                      value={item.size}
                      onChange={(event) =>
                        setItem(index, { size: event.target.value })
                      }
                      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 outline-none focus:border-ring"
                    />
                  </label>
                  <label className="block text-xs font-semibold">
                    Тесто
                    <input
                      type="number"
                      value={item.pizzaType}
                      onChange={(event) =>
                        setItem(index, { pizzaType: event.target.value })
                      }
                      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 outline-none focus:border-ring"
                    />
                  </label>
                  <label className="block text-xs font-semibold">
                    URL изображения варианта
                    <input
                      required
                      value={item.imageUrl}
                      onChange={(event) =>
                        setItem(index, { imageUrl: event.target.value })
                      }
                      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 outline-none focus:border-ring"
                    />
                  </label>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Удалить вариант"
                      disabled={form.items.length === 1}
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

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
        title="Удалить товар?"
        description="Товар будет удалён вместе с вариантами, если они ещё не используются в корзинах или заказах."
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
