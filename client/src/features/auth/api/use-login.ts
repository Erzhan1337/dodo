import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginFormValues } from "@/features/auth/model/login-schema";
import { $api, establishAuthenticatedSession } from "@/shared/api";
import { CART_QUERY_KEY } from "@/entities/cart/model/query-key";

const login = async (data: LoginFormValues) => {
  const response = await $api.post("/auth/login", data);
  return response.data;
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      establishAuthenticatedSession(data.user, data.accessToken);
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
