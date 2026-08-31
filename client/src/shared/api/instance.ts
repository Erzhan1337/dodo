import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  clearAuthSession,
  useSessionStore,
} from "@/entities/session/model/store";
import type { User } from "@/entities/session/model/types";

type AuthResponse = {
  user: User;
  accessToken: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _isRetry?: boolean;
};

let refreshPromise: Promise<string> | null = null;
let authGeneration = 0;

export const $api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const authApi = axios.create({
  baseURL: process.env.SERVER_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const isUnauthorized = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const refreshAccessToken = () => {
  refreshPromise ??= (() => {
    const requestGeneration = authGeneration;

    return authApi
      .post<AuthResponse>("/auth/login/access-token")
      .then((response) => {
        const { user, accessToken } = response.data;

        if (requestGeneration !== authGeneration) {
          throw new axios.CanceledError("Authentication state changed");
        }

        useSessionStore.getState().setAuthData(user, accessToken);
        return accessToken;
      })
      .catch((error: unknown) => {
        if (requestGeneration === authGeneration) {
          if (isUnauthorized(error)) {
            clearAuthSession();
          } else {
            useSessionStore.getState().setAuthUnavailable();
          }
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  })();

  return refreshPromise;
};

export const establishAuthenticatedSession = (user: User, accessToken: string) => {
  authGeneration += 1;
  useSessionStore.getState().setAuthData(user, accessToken);
};

export const logout = async () => {
  authGeneration += 1;
  await authApi.post("/auth/logout");
  clearAuthSession();
};

$api.interceptors.request.use((config) => {
  const accessToken = useSessionStore.getState().accessToken;
  const isAuthRequest = config.url?.startsWith("/auth/");

  if (config.headers && accessToken && !isAuthRequest) {
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
      !originalRequest.url?.startsWith("/auth/")
    ) {
      originalRequest._isRetry = true;
      const newAccessToken = await refreshAccessToken();

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      return $api.request(originalRequest);
    }

    throw error;
  },
);
