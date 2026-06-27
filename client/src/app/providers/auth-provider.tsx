"use client";
import { ReactNode, useEffect } from "react";
import {
  useSessionStore,
  AUTH_CHANNEL,
  AUTH_LOGOUT_EVENT,
} from "@/entities/session/model/store";
import { $api } from "@/shared/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  EMPTY_CART_RESPONSE,
  getCartQueryKey,
} from "@/entities/cart/model/query-key";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const setAuthData = useSessionStore((state) => state.setAuthData);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const logout = useSessionStore((state) => state.logout);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  useEffect(() => {
    const checkAuth = async () => {
      if (!_hasHydrated) return;
      if (!isAuthenticated) return;

      if (accessToken) return;

      try {
        const { data } = await $api.post("auth/login/access-token");
        setAuthData(data.user, data.accessToken);
      } catch {
        logout();
      }
    };
    void checkAuth();
  }, [setAuthData, isAuthenticated, logout, _hasHydrated, accessToken]);

  useEffect(() => {
    const clearSession = () => {
      const userId = useSessionStore.getState().user?.id;

      if (userId) {
        queryClient.removeQueries({
          queryKey: getCartQueryKey(userId),
          exact: true,
        });
      }

      queryClient.setQueryData(getCartQueryKey(null), EMPTY_CART_RESPONSE);
      useSessionStore.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
      void queryClient.invalidateQueries({
        queryKey: getCartQueryKey(null),
        exact: true,
      });
    };

    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = (e: MessageEvent<string>) => {
      if (e.data === "logout") {
        clearSession();
      }
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, clearSession);

    return () => {
      channel.close();
      window.removeEventListener(AUTH_LOGOUT_EVENT, clearSession);
    };
  }, [queryClient]);

  return <>{children}</>;
};
