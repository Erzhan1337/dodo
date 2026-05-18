import { useMutation } from "@tanstack/react-query";
import { RegisterFormValues } from "@/features/auth/model/register-schema";
import { $api } from "@/shared/api";
import toast from "react-hot-toast";

const register = async (data: RegisterFormValues) => {
  const response = await $api.post("/auth/register", {
    name: data.name,
    email: data.email || undefined,
    password: data.password,
    phone: data.phone,
  });
  return response.data;
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: () => toast.success("Успешная регистрация!"),
  });
};
