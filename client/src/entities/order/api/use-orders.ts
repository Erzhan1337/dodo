"use client";

import { useQuery } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import { useSessionStore } from "@/entities/session/model/store";
import type { Order } from "@/entities/order/model/types";

export const ORDERS_QUERY_KEY = ["orders"] as const;

export const getOrdersQueryKey = (userId?: string | null) =>
  [...ORDERS_QUERY_KEY, userId ?? "guest"] as const;

export const useOrders = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const userId = useSessionStore((state) => state.user?.id);
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery<Order[]>({
    queryKey: getOrdersQueryKey(userId),
    queryFn: async () => {
      const { data } = await $api.get<Order[]>("/order/my");
      return data;
    },
    enabled: _hasHydrated && isAuthenticated && Boolean(accessToken),
  });
};
