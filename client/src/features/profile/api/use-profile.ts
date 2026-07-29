import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { $api } from "@/shared/api";
import { useSessionStore } from "@/entities/session/model/store";
import type { User } from "@/entities/session/model/types";
import type { ProfileFormValues } from "@/features/profile/model/profile-schema";
import toast from "react-hot-toast";

export const PROFILE_QUERY_KEY = ["profile", "me"] as const;

export const useProfile = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery<User>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const { data } = await $api.get<User>("/user/me");
      return data;
    },
    enabled: _hasHydrated && isAuthenticated && Boolean(accessToken),
  });
};

export const useUpdateProfile = () => {
  const updateUser = useSessionStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data } = await $api.patch<User>("/user/me", values);
      return data;
    },
    onSuccess: (user) => {
      updateUser(user);
      queryClient.setQueryData(PROFILE_QUERY_KEY, user);
      toast.success("Профиль сохранён");
    },
  });
};
