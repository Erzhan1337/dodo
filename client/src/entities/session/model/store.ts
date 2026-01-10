import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; // 1. Импортируем middleware
import { $api } from "@/shared/api";

interface SessionState {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuthData: (user: any, accessToken: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuthData: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: async () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        try {
          await $api.post("auth/logout");
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
