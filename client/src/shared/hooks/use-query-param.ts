"use client";
import { useRouter, useSearchParams } from "next/navigation";

export const useQueryParam = (key: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(key);

  const setQueryParam = (newValue: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue === null || newValue === "") {
      params.delete(key);
    } else {
      params.set(key, newValue);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  return { value, setQueryParam };
};
