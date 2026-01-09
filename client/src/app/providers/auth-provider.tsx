"use client";
import { ReactNode, useEffect } from "react";
import { useSessionStore } from "@/entities/session/model/store";
import { $api } from "@/shared/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setAuthData = useSessionStore((state) => state.setAuthData);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await $api.post("auth/login/access-token");

        setAuthData(data.user, data.accessToken);
      } catch (e) {
        console.log("User is not authenticated");
      }
    };
    checkAuth();
  }, [setAuthData]);
  return <>{children}</>;
};
