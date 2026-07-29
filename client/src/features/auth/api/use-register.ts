import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterFormValues } from "@/features/auth/model/register-schema";
import { $api, establishAuthenticatedSession } from "@/shared/api";
import toast from "react-hot-toast";
import { CART_QUERY_KEY } from "@/entities/cart/model/query-key";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      establishAuthenticatedSession(data.user, data.accessToken);
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Успешная регистрация!");
    },
  });
};
