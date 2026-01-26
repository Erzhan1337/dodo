import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginFormValues } from "@/features/auth/model/login-schema";
import { $api } from "@/shared/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useSessionStore } from "@/entities/session/model/store";

const login = async (data: LoginFormValues) => {
  const response = await $api.post("/auth/login", data);
  return response.data;
};

const error = (error: AxiosError<{ message: string }>) => {
  const errorMessage = error.response?.data?.message || "Ошибка авторизации";
  toast.error(errorMessage);
};

// В use-login.ts
export const useLoginMutation = () => {
  const setAuthData = useSessionStore((state) => state.setAuthData); // Достаем экшен
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthData(data.userWithoutPassword, data.accessToken); // Сохраняем юзера и токен
      const queryClient = useQueryClient();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: error,
  });
};
