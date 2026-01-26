import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginFormValues } from "@/features/auth/model/login-schema";
import { $api } from "@/shared/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const login = async (data: LoginFormValues) => {
  const response = await $api.post("/auth/login", data);
  return response.data;
};

const success = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["cart"] });
};

const error = (error: AxiosError<{ message: string }>) => {
  const errorMessage = error.response?.data?.message || "Ошибка авторизации";
  toast.error(errorMessage);
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: success,
    onError: error,
  });
};
