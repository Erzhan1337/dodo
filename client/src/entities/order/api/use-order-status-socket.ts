"use client";

import { useEffect, useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import type { Order, OrderStatus } from "@/entities/order/model/types";
import { ORDERS_QUERY_KEY } from "./use-orders";

type OrderStatusPayload = {
  id: string;
  token: string;
  status: OrderStatus;
  updatedAt: string;
};

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const createOrderSocket = (): Socket | null => {
  if (!SOCKET_URL) return null;

  return io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
  });
};

const isFreshStatus = (order: Order, payload: OrderStatusPayload) =>
  new Date(payload.updatedAt).getTime() >= new Date(order.updatedAt).getTime();

const applyStatus = (order: Order, payload: OrderStatusPayload): Order => {
  if (order.token !== payload.token || !isFreshStatus(order, payload)) {
    return order;
  }

  return {
    ...order,
    status: payload.status,
    updatedAt: payload.updatedAt,
  };
};

const updateCachedOrders = (
  queryClient: QueryClient,
  payload: OrderStatusPayload,
) => {
  queryClient.setQueriesData<Order[]>(
    { queryKey: ORDERS_QUERY_KEY },
    (orders) => orders?.map((order) => applyStatus(order, payload)),
  );
};

export const useRealtimeOrderStatus = (initialOrder: Order) => {
  const [order, setOrder] = useState(initialOrder);
  const queryClient = useQueryClient();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    const socket = createOrderSocket();
    if (!socket) return;

    const subscribe = () => {
      socket.emit("order:subscribe", { token: initialOrder.token });
    };

    const handleStatus = (payload: OrderStatusPayload) => {
      if (payload.token !== initialOrder.token) return;

      setOrder((currentOrder) => applyStatus(currentOrder, payload));
      updateCachedOrders(queryClient, payload);
    };

    socket.on("connect", subscribe);
    socket.on("order:status", handleStatus);

    return () => {
      socket.emit("order:unsubscribe", { token: initialOrder.token });
      socket.off("connect", subscribe);
      socket.off("order:status", handleStatus);
      socket.disconnect();
    };
  }, [initialOrder.token, queryClient]);

  return order;
};

export const useRealtimeOrdersStatus = (orders?: Order[]) => {
  const queryClient = useQueryClient();
  const tokensKey = orders?.map((order) => order.token).join("|") ?? "";

  useEffect(() => {
    if (!tokensKey) return;

    const socket = createOrderSocket();
    if (!socket) return;

    const tokens = tokensKey.split("|");
    const subscribe = () => {
      tokens.forEach((token) => {
        socket.emit("order:subscribe", { token });
      });
    };

    const handleStatus = (payload: OrderStatusPayload) => {
      updateCachedOrders(queryClient, payload);
    };

    socket.on("connect", subscribe);
    socket.on("order:status", handleStatus);

    return () => {
      tokens.forEach((token) => {
        socket.emit("order:unsubscribe", { token });
      });
      socket.off("connect", subscribe);
      socket.off("order:status", handleStatus);
      socket.disconnect();
    };
  }, [queryClient, tokensKey]);
};
