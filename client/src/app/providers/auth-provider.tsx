"use client";

import { ReactNode, useEffect, useRef } from "react";
import {
  AUTH_CHANNEL,
  AUTH_LOGOUT_EVENT,
  AUTH_LOGOUT_STORAGE_KEY,
  LEGACY_SESSION_STORAGE_KEY,
  useSessionStore,
} from "@/entities/session/model/store";
import { refreshAccessToken } from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  EMPTY_CART_RESPONSE,
  getCartQueryKey,
} from "@/entities/cart/model/query-key";
import { favoriteKeys } from "@/features/favorites";

const AUTH_RETRY_BASE_DELAY_MS = 2_000;
const AUTH_RETRY_MAX_DELAY_MS = 30_000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const retryAttemptRef = useRef(0);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setHasHydrated = useSessionStore((state) => state.setHasHydrated);
  const retryAuthBootstrap = useSessionStore(
    (state) => state.retryAuthBootstrap,
  );
  const status = useSessionStore((state) => state.status);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
    } catch {}

    setHasHydrated();
  }, [setHasHydrated]);

  useEffect(() => {
    if (!_hasHydrated || status !== "bootstrapping") return;

    void refreshAccessToken().catch(() => undefined);
  }, [_hasHydrated, status]);

  useEffect(() => {
    if (!_hasHydrated || status !== "unavailable") return;

    const exponentialDelay = Math.min(
      AUTH_RETRY_BASE_DELAY_MS * 2 ** retryAttemptRef.current,
      AUTH_RETRY_MAX_DELAY_MS,
    );
    const jitter = Math.floor(Math.random() * 500);
    retryAttemptRef.current += 1;
    const timer = window.setTimeout(
      retryAuthBootstrap,
      exponentialDelay + jitter,
    );

    return () => window.clearTimeout(timer);
  }, [_hasHydrated, retryAuthBootstrap, status]);

  useEffect(() => {
    if (status === "authenticated" || status === "anonymous") {
      retryAttemptRef.current = 0;
    }
  }, [status]);

  useEffect(() => {
    const clearSessionData = () => {
      const userId = useSessionStore.getState().user?.id;

      if (userId) {
        queryClient.removeQueries({
          queryKey: getCartQueryKey(userId),
          exact: true,
        });
      }

      queryClient.setQueryData(getCartQueryKey(null), EMPTY_CART_RESPONSE);
      queryClient.removeQueries({ queryKey: favoriteKeys.root });
      queryClient.removeQueries({ queryKey: ["admin"] });
      clearSession();
      void queryClient.invalidateQueries({
        queryKey: getCartQueryKey(null),
        exact: true,
      });
    };

    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(AUTH_CHANNEL);
    if (channel) {
      channel.onmessage = (event: MessageEvent<string>) => {
        if (event.data === "logout") clearSessionData();
      };
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_LOGOUT_STORAGE_KEY) clearSessionData();
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, clearSessionData);
    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener(AUTH_LOGOUT_EVENT, clearSessionData);
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearSession, queryClient]);

  return <>{children}</>;
};
