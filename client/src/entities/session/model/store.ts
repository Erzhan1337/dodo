import { create } from "zustand";
import { $api } from "@/shared/api";

interface SessionState {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuthData: (user: any, accessToken: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuthData: (user, accessToken) => {
    set({ user: user, accessToken: accessToken, isAuthenticated: true });
  },

  logout: async () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    await $api.post("auth/logout");
  },
}));
