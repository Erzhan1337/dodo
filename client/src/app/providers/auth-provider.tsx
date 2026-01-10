"use client";
import { ReactNode, useEffect, useState } from "react";
import { useSessionStore } from "@/entities/session/model/store";
import { $api } from "@/shared/api";
import Image from "next/image";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const setAuthData = useSessionStore((state) => state.setAuthData);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const logout = useSessionStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await $api.post("auth/login/access-token");
        setTimeout(() => {
          setAuthData(data.user, data.accessToken);
        }, 10000);
      } catch (e) {
        console.log("User is not authenticated");
        logout();
      } finally {
        setIsLoading(false);
      }
    };
    void checkAuth();
  }, [setAuthData, isAuthenticated, logout]);
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="relative w-10 h-10 animate-pulse">
          <Image
            src="https://res.cloudinary.com/dgtya5crt/image/upload/v1767594112/%D0%BA%D0%BE%D0%BB%D0%B1%D0%B0%D1%81%D0%BA%D0%B8_%D0%B1%D0%B0%D1%80%D0%B1%D0%B5%D0%BA%D1%8E_o8so4w.avif"
            alt="loader"
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
