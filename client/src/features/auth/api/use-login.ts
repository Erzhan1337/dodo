import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginFormValues } from "@/features/auth/model/login-schema";
import { $api } from "@/shared/api";
import { useSessionStore } from "@/entities/session/model/store";
import { CART_QUERY_KEY } from "@/entities/cart/model/query-key";

const login = async (data: LoginFormValues) => {
  const response = await $api.post("/auth/login", data);
  return response.data;
};

export const useLoginMutation = () => {
  const setAuthData = useSessionStore((state) => state.setAuthData);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthData(data.user, data.accessToken);
      queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
