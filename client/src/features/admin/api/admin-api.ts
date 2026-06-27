"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { $api } from "@/shared/api";
import type {
  AdminCategory,
  AdminDashboard,
  AdminIngredient,
  AdminListParams,
  AdminOrder,
  AdminOrderDetails,
  AdminProduct,
  AdminProductPayload,
  AdminUser,
  AdminUserPayload,
  PaginatedResponse,
} from "@/features/admin/model/types";
import type { OrderStatus } from "@/entities/order/model/types";

export const adminKeys = {
  root: ["admin"] as const,
  dashboard: () => [...adminKeys.root, "dashboard"] as const,
  products: (params: AdminListParams) =>
    [...adminKeys.root, "products", params] as const,
  product: (id: string) => [...adminKeys.root, "product", id] as const,
  orders: (params: AdminListParams) =>
    [...adminKeys.root, "orders", params] as const,
  order: (id: string) => [...adminKeys.root, "order", id] as const,
  users: (params: AdminListParams) =>
    [...adminKeys.root, "users", params] as const,
  categories: (params: AdminListParams) =>
    [...adminKeys.root, "categories", params] as const,
  ingredients: (params: AdminListParams) =>
    [...adminKeys.root, "ingredients", params] as const,
};

const cleanParams = (params: AdminListParams) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async ({ signal }): Promise<AdminDashboard> => {
      const { data } = await $api.get("/admin/dashboard", { signal });
      return data;
    },
    staleTime: 60_000,
  });
};

export const useAdminProducts = (params: AdminListParams) => {
  return useQuery({
    queryKey: adminKeys.products(params),
    queryFn: async ({ signal }): Promise<PaginatedResponse<AdminProduct>> => {
      const { data } = await $api.get("/admin/products", {
        params: cleanParams(params),
        signal,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useAdminProduct = (id?: string) => {
  return useQuery({
    queryKey: adminKeys.product(id ?? "new"),
    queryFn: async ({ signal }): Promise<AdminProduct> => {
      const { data } = await $api.get(`/admin/products/${id}`, { signal });
      return data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateAdminProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminProductPayload) => {
      const { data } = await $api.post<AdminProduct>("/admin/products", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Товар создан");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "products"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useUpdateAdminProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AdminProductPayload }) => {
      const { data } = await $api.patch<AdminProduct>(`/admin/products/${id}`, payload);
      return data;
    },
    onSuccess: (product) => {
      toast.success("Товар сохранён");
      queryClient.setQueryData(adminKeys.product(product.id), product);
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "products"] });
    },
  });
};

export const useDeleteAdminProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await $api.delete(`/admin/products/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Товар удалён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "products"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useAdminOrders = (params: AdminListParams) => {
  return useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: async ({ signal }): Promise<PaginatedResponse<AdminOrder>> => {
      const { data } = await $api.get("/admin/orders", {
        params: cleanParams(params),
        signal,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useAdminOrder = (id?: string) => {
  return useQuery({
    queryKey: adminKeys.order(id ?? "empty"),
    queryFn: async ({ signal }): Promise<AdminOrderDetails> => {
      const { data } = await $api.get(`/admin/orders/${id}`, { signal });
      return data;
    },
    enabled: Boolean(id),
  });
};

export const useUpdateAdminOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data } = await $api.patch<AdminOrder>(`/admin/orders/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: (order) => {
      toast.success("Статус заказа обновлён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "orders"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.order(order.id) });
      void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useDeleteAdminOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await $api.delete(`/admin/orders/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Заказ удалён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "orders"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useAdminUsers = (params: AdminListParams) => {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async ({ signal }): Promise<PaginatedResponse<AdminUser>> => {
      const { data } = await $api.get("/admin/users", {
        params: cleanParams(params),
        signal,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminUserPayload & { password: string }) => {
      const { data } = await $api.post<AdminUser>("/admin/users", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Пользователь создан");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "users"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: AdminUserPayload }) => {
      const { data } = await $api.patch<AdminUser>(`/admin/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Пользователь сохранён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "users"] });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await $api.delete(`/admin/users/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Пользователь удалён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "users"] });
      void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
};

export const useAdminCategories = (params: AdminListParams) => {
  return useQuery({
    queryKey: adminKeys.categories(params),
    queryFn: async ({ signal }): Promise<PaginatedResponse<AdminCategory>> => {
      const { data } = await $api.get("/admin/categories", {
        params: cleanParams(params),
        signal,
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await $api.post<AdminCategory>("/admin/categories", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Категория создана");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "categories"] });
    },
  });
};

export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data } = await $api.patch<AdminCategory>(`/admin/categories/${id}`, {
        name,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Категория сохранена");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "categories"] });
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "products"] });
    },
  });
};

export const useDeleteAdminCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await $api.delete(`/admin/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Категория удалена");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "categories"] });
    },
  });
};

export const useAdminIngredients = (params: AdminListParams) => {
  return useQuery({
    queryKey: adminKeys.ingredients(params),
    queryFn: async ({ signal }): Promise<PaginatedResponse<AdminIngredient>> => {
      const { data } = await $api.get("/admin/ingredients", {
        params: cleanParams(params),
        signal,
      });
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useCreateAdminIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; price: number; imageUrl: string }) => {
      const { data } = await $api.post<AdminIngredient>("/admin/ingredients", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Ингредиент создан");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "ingredients"] });
    },
  });
};

export const useUpdateAdminIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; price: number; imageUrl: string };
    }) => {
      const { data } = await $api.patch<AdminIngredient>(
        `/admin/ingredients/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Ингредиент сохранён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "ingredients"] });
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "products"] });
    },
  });
};

export const useDeleteAdminIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await $api.delete(`/admin/ingredients/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Ингредиент удалён");
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.root, "ingredients"] });
    },
  });
};
