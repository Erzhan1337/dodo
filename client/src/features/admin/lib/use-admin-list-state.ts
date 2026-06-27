"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminListParams, SortOrder } from "@/features/admin/model/types";

const DEFAULT_LIMIT = 10;

export const useAdminListState = (
  defaultSortBy: string,
  filterKeys: Array<keyof AdminListParams> = [],
) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params = useMemo<AdminListParams>(() => {
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || String(DEFAULT_LIMIT));
    const sortOrder = (searchParams.get("sortOrder") || "desc") as SortOrder;
    const nextParams: AdminListParams = {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || defaultSortBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
    };

    filterKeys.forEach((key) => {
      const value = searchParams.get(String(key));
      if (!value) return;

      if (key === "categoryId") {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) nextParams.categoryId = numericValue;
        return;
      }

      nextParams[key] = value as never;
    });

    return nextParams;
  }, [defaultSortBy, filterKeys, searchParams]);

  const setParams = useCallback(
    (updates: Partial<AdminListParams>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) {
          next.delete(key);
          return;
        }
        next.set(key, String(value));
      });

      if (resetPage) next.set("page", "1");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPage = useCallback(
    (page: number) => setParams({ page }, false),
    [setParams],
  );

  const setSort = useCallback(
    (sortBy: string) => {
      const sortOrder =
        params.sortBy === sortBy && params.sortOrder === "asc" ? "desc" : "asc";
      setParams({ sortBy, sortOrder });
    },
    [params.sortBy, params.sortOrder, setParams],
  );

  return { params, setParams, setPage, setSort };
};
