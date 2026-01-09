import { useMutation } from "@tanstack/react-query";
import { LoginFormValues } from "@/features/auth/model/login-schema";
import { $api } from "@/shared/api";

const login = async (data: LoginFormValues) => {
  const response = await $api.post("/auth/login", data);
  return response.data;
};

const error = (error: any) => {
  alert(error.message);
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
    onError: error,
  });
};
