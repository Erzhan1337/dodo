"use client";

import { useEffect, useState } from "react";
import { useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type {
  AdminListParams,
  AdminOrder,
  AdminOrderDetails,
  PaginatedResponse,
} from "@/features/admin/model/types";
import { adminKeys } from "@/features/admin/api/admin-api";
import { useSessionStore } from "@/entities/session/model/store";

type RealtimeState = "idle" | "connecting" | "connected" | "error";
type AdminOrderDeletedEvent = { id: string };

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;
const ordersQueryRoot = [...adminKeys.root, "orders"] as const;

const normalize = (value: string | null | undefined) =>
  value?.toLowerCase().trim() ?? "";

const matchesSearch = (order: AdminOrder, search?: string) => {
  const query = normalize(search);
  if (!query) return true;

  return [
    order.token,
    order.name,
    order.phone,
    order.address,
    order.email,
  ].some((value) => normalize(value).includes(query));
};

const matchesParams = (order: AdminOrder, params: AdminListParams) => {
  if (params.status && order.status !== params.status) return false;
  return matchesSearch(order, params.search);
};

const isFirstLatestPage = (params: AdminListParams) => {
  const page = params.page ?? 1;
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";

  return page === 1 && sortBy === "createdAt" && sortOrder === "desc";
};

const getOrderQueryParams = (queryKey: QueryKey): AdminListParams => {
  const [, , params] = queryKey;
  return typeof params === "object" && params !== null
    ? (params as AdminListParams)
    : {};
};

const updateMetaTotal = (
  meta: PaginatedResponse<AdminOrder>["meta"],
  delta: number,
) => {
  const total = Math.max(0, meta.total + delta);

  return {
    ...meta,
    total,
    totalPages: Math.ceil(total / meta.limit),
  };
};

const patchOrdersQueries = (
  queryClient: QueryClient,
  updater: (
    current: PaginatedResponse<AdminOrder>,
    params: AdminListParams,
  ) => PaginatedResponse<AdminOrder>,
) => {
  const queries = queryClient
    .getQueryCache()
    .findAll({ queryKey: ordersQueryRoot });

  queries.forEach((query) => {
    const params = getOrderQueryParams(query.queryKey);
    queryClient.setQueryData<PaginatedResponse<AdminOrder>>(
      query.queryKey,
      (current) => (current ? updater(current, params) : current),
    );
  });
};

const addCreatedOrder = (
  current: PaginatedResponse<AdminOrder>,
  params: AdminListParams,
  order: AdminOrder,
) => {
  if (!matchesParams(order, params) || !isFirstLatestPage(params)) {
    return current;
  }

  const existingIndex = current.data.findIndex((item) => item.id === order.id);
  if (existingIndex >= 0) {
    const nextData = [...current.data];
    nextData[existingIndex] = order;
    return { ...current, data: nextData };
  }

  const limit = current.meta.limit;
  return {
    data: [order, ...current.data].slice(0, limit),
    meta: updateMetaTotal(current.meta, 1),
  };
};

const updateOrderInList = (
  current: PaginatedResponse<AdminOrder>,
  params: AdminListParams,
  order: AdminOrder,
) => {
  const existingIndex = current.data.findIndex((item) => item.id === order.id);
  if (existingIndex < 0) return current;

  if (!matchesParams(order, params)) {
    return {
      data: current.data.filter((item) => item.id !== order.id),
      meta: updateMetaTotal(current.meta, -1),
    };
  }

  const nextData = [...current.data];
  nextData[existingIndex] = order;
  return { ...current, data: nextData };
};

const removeOrderFromList = (
  current: PaginatedResponse<AdminOrder>,
  orderId: string,
) => {
  if (!current.data.some((order) => order.id === orderId)) return current;

  return {
    data: current.data.filter((order) => order.id !== orderId),
    meta: updateMetaTotal(current.meta, -1),
  };
};

const invalidateOrderDependencies = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: ordersQueryRoot });
  void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
};

export const useAdminOrdersRealtime = () => {
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const user = useSessionStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const [state, setState] = useState<RealtimeState>("idle");

  useEffect(() => {
    if (!SOCKET_URL || !accessToken || !isAdmin) {
      setState("idle");
      return;
    }

    setState("connecting");

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { accessToken },
    });

    const subscribe = () => {
      socket.emit("admin:orders:subscribe", { accessToken });
    };

    const handleCreated = (order: AdminOrder) => {
      patchOrdersQueries(queryClient, (current, params) =>
        addCreatedOrder(current, params, order),
      );
      invalidateOrderDependencies(queryClient);
    };

    const handleUpdated = (order: AdminOrder) => {
      patchOrdersQueries(queryClient, (current, params) =>
        updateOrderInList(current, params, order),
      );
      queryClient.setQueryData<AdminOrderDetails>(
        adminKeys.order(order.id),
        (current) => (current ? { ...current, ...order } : current),
      );
      invalidateOrderDependencies(queryClient);
    };

    const handleDeleted = ({ id }: AdminOrderDeletedEvent) => {
      patchOrdersQueries(queryClient, (current) => removeOrderFromList(current, id));
      queryClient.removeQueries({ queryKey: adminKeys.order(id) });
      invalidateOrderDependencies(queryClient);
    };

    socket.on("connect", subscribe);
    socket.on("admin:orders:ready", () => setState("connected"));
    socket.on("admin:orders:error", () => setState("error"));
    socket.on("connect_error", () => setState("error"));
    socket.on("disconnect", () => setState("connecting"));
    socket.on("admin:orders:created", handleCreated);
    socket.on("admin:orders:updated", handleUpdated);
    socket.on("admin:orders:deleted", handleDeleted);

    return () => {
      socket.emit("admin:orders:unsubscribe");
      socket.off("connect", subscribe);
      socket.off("admin:orders:created", handleCreated);
      socket.off("admin:orders:updated", handleUpdated);
      socket.off("admin:orders:deleted", handleDeleted);
      socket.disconnect();
    };
  }, [accessToken, isAdmin, queryClient]);

  return state;
};
