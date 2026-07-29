import { create } from "zustand";
import type { User } from "@/entities/session/model/types";

export const AUTH_CHANNEL = "auth";
export const AUTH_LOGOUT_EVENT = "auth:logout";
export const AUTH_LOGOUT_STORAGE_KEY = "auth:logout-at";
export const LEGACY_SESSION_STORAGE_KEY = "session-storage";

export type AuthStatus =
  | "bootstrapping"
  | "authenticated"
  | "anonymous"
  | "unavailable";

interface SessionState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  _hasHydrated: boolean;
  setAuthData: (user: User, accessToken: string) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
  setAuthUnavailable: () => void;
  retryAuthBootstrap: () => void;
  setHasHydrated: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: "bootstrapping",
  _hasHydrated: false,

  setAuthData: (user, accessToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: true,
      status: "authenticated",
    });
  },

  updateUser: (user) => {
    set({ user });
  },

  clearSession: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      status: "anonymous",
    });
  },

  setAuthUnavailable: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      status: "unavailable",
    });
  },

  retryAuthBootstrap: () => {
    set({ status: "bootstrapping" });
  },

  setHasHydrated: () => {
    set({ _hasHydrated: true });
  },
}));

export const clearAuthSession = () => {
  if (typeof window === "undefined") {
    useSessionStore.getState().clearSession();
    return;
  }

  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage("logout");
    channel.close();
  }

  try {
    window.localStorage.setItem(AUTH_LOGOUT_STORAGE_KEY, String(Date.now()));
  } catch {}

  useSessionStore.getState().clearSession();
};
