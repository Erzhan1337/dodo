import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { $api } from "@/shared/api";
import type { User } from "@/entities/session/model/types";

export const AUTH_CHANNEL = "auth";
export const AUTH_LOGOUT_EVENT = "auth:logout";

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

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        void $api.post("auth/logout");
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));

        const channel = new BroadcastChannel(AUTH_CHANNEL);
        channel.postMessage("logout");
        channel.close();
      },
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    },
  ),
);
