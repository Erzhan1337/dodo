import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "@/entities/session/model/store";
import type { User } from "@/entities/session/model/types";

type AuthResponse = {
  user: User;
  accessToken: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _isRetry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

export const $api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const refreshAccessToken = () => {
  refreshPromise ??= axios
    .post<AuthResponse>(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login/access-token`,
      {},
      { withCredentials: true },
    )
    .then((response) => {
      const { user, accessToken } = response.data;
      useSessionStore.getState().setAuthData(user, accessToken);
      return accessToken;
    })
    .catch((error) => {
      useSessionStore.getState().logout();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

$api.interceptors.request.use((config) => {
  const accessToken = useSessionStore.getState().accessToken;

  if (config.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

$api.interceptors.response.use(
  (config) => config,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry &&
      !originalRequest.url?.includes("/auth/login/access-token")
    ) {
      originalRequest._isRetry = true;
      try {
        const newAccessToken = await refreshAccessToken();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return $api.request(originalRequest);
      } catch (refreshError) {
        throw refreshError;
      }
    }
    throw error;
  },
);
