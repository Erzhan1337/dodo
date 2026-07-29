"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSessionStore } from "@/entities/session/model/store";
import type { Product } from "@/entities/product";
import { $api } from "@/shared/api";

type FavoriteIdsResponse = {
  ids: string[];
};

type ToggleFavoriteValues = {
  productId: string;
  productName?: string;
  product?: Product;
  nextFavorite: boolean;
};

type FavoriteMutationContext = {
  previousIds?: FavoriteIdsResponse;
  previousProducts?: Product[];
};

export const favoriteKeys = {
  root: ["favorites"] as const,
  ids: (userId?: string | null) =>
    [...favoriteKeys.root, "ids", userId ?? "guest"] as const,
  list: (userId?: string | null) =>
    [...favoriteKeys.root, "list", userId ?? "guest"] as const,
};

const getCurrentUserId = () => useSessionStore.getState().user?.id ?? null;

export const useFavoriteProductIds = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const userId = useSessionStore((state) => state.user?.id);
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: favoriteKeys.ids(userId),
    queryFn: async (): Promise<FavoriteIdsResponse> => {
      const { data } = await $api.get<FavoriteIdsResponse>("/favorites/ids");
      return data;
    },
    enabled: _hasHydrated && isAuthenticated && Boolean(accessToken),
    staleTime: 60_000,
  });
};

export const useFavoriteProducts = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const userId = useSessionStore((state) => state.user?.id);
  const accessToken = useSessionStore((state) => state.accessToken);

  return useQuery({
    queryKey: favoriteKeys.list(userId),
    queryFn: async (): Promise<Product[]> => {
      const { data } = await $api.get<Product[]>("/favorites");
      return data;
    },
    enabled: _hasHydrated && isAuthenticated && Boolean(accessToken),
  });
};

export const useIsFavoriteProduct = (productId: string) => {
  const { data, isLoading, isFetching } = useFavoriteProductIds();

  return {
    isFavorite: Boolean(data?.ids.includes(productId)),
    isLoading: isLoading || isFetching,
  };
};

export const useToggleFavoriteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product | { productId: string }, unknown, ToggleFavoriteValues, FavoriteMutationContext>({
    mutationFn: async ({ productId, nextFavorite }) => {
      if (nextFavorite) {
        const { data } = await $api.post<Product>(`/favorites/${productId}`);
        return data;
      }

      const { data } = await $api.delete<{ productId: string }>(
        `/favorites/${productId}`,
      );
      return data;
    },
    onMutate: async (values) => {
      const userId = getCurrentUserId();
      const idsKey = favoriteKeys.ids(userId);
      const listKey = favoriteKeys.list(userId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: idsKey }),
        queryClient.cancelQueries({ queryKey: listKey }),
      ]);

      const previousIds =
        queryClient.getQueryData<FavoriteIdsResponse>(idsKey);
      const previousProducts = queryClient.getQueryData<Product[]>(listKey);

      queryClient.setQueryData<FavoriteIdsResponse>(idsKey, (current) => {
        const ids = current?.ids ?? [];
        const nextIds = values.nextFavorite
          ? [values.productId, ...ids.filter((id) => id !== values.productId)]
          : ids.filter((id) => id !== values.productId);

        return { ids: nextIds };
      });

      queryClient.setQueryData<Product[]>(listKey, (current) => {
        if (!current) return current;

        if (!values.nextFavorite) {
          return current.filter((product) => product.id !== values.productId);
        }

        if (!values.product || current.some((product) => product.id === values.productId)) {
          return current;
        }

        return [values.product, ...current];
      });

      return { previousIds, previousProducts };
    },
    onError: (_error, _values, context) => {
      const userId = getCurrentUserId();

      if (context?.previousIds) {
        queryClient.setQueryData(favoriteKeys.ids(userId), context.previousIds);
      }

      if (context?.previousProducts) {
        queryClient.setQueryData(
          favoriteKeys.list(userId),
          context.previousProducts,
        );
      }
    },
    onSuccess: (_data, values) => {
      toast.success(
        values.nextFavorite
          ? "Добавлено в избранное"
          : "Удалено из избранного",
      );
    },
    onSettled: () => {
      const userId = getCurrentUserId();

      void queryClient.invalidateQueries({ queryKey: favoriteKeys.ids(userId) });
      void queryClient.invalidateQueries({ queryKey: favoriteKeys.list(userId) });
    },
  });
};
