"use client";
import { useEffect, useRef, useState } from "react";
import {
  useClickOutside,
  useDebounce,
  useEscape,
  useScroll,
} from "@/shared/hooks";
import { useRouter, useSearchParams } from "next/navigation";

export const useSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(searchParams?.get("query") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const currentQuery = searchParams?.get("query") || "";
    if (currentQuery === debouncedQuery) return;
    const params = new URLSearchParams(searchParams?.toString());
    if (debouncedQuery) {
      params.set("query", debouncedQuery);
    } else {
      params.delete("query");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, searchParams]);

  useEffect(() => {
    const urlQuery = searchParams?.get("query") || "";
    if (urlQuery !== query && !focused) {
      setQuery(urlQuery);
    }
  }, [searchParams, query, focused]);

  const closeSearch = () => {
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
  };

  const ref = useClickOutside<HTMLDivElement>(closeSearch);
  useEscape(closeSearch);
  useScroll(closeSearch, focused);

  return {
    focused,
    setFocused,
    query,
    setQuery,
    debouncedQuery,
    ref,
    inputRef,
  };
};
