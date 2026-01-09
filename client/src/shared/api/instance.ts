import axios from "axios";
import { useSessionStore } from "@/entities/session/model/store";

export const $api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

$api.interceptors.response.use((config) => {
  const accessToken = useSessionStore.getState().accessToken;

  if (config.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

$api.interceptors.response.use(
  (config) => config,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._isRetry &&
      error.config
    ) {
      originalRequest._isRetry = true;
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login/access-token`,
          {},
          { withCredentials: true },
        );
        useSessionStore
          .getState()
          .setAuthData(response.data.user, response.data.accessToken);
        return $api.request(originalRequest);
      } catch (e) {
        console.log("Не авторизован");
        useSessionStore.getState().logout();
      }
    }
    throw error;
  },
);
