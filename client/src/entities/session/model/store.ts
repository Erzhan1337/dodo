import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { $api } from "@/shared/api";
import type { User } from "@/entities/session/model/types";

interface SessionState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuthData: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,
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
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    },
  ),
);
