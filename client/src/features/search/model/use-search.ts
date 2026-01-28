"use client";

import { useEffect, useRef, useState } from "react";
import {
  useClickOutside,
  useDebounce,
  useEscape,
  useScroll,
} from "@/shared/hooks";
import { usePathname } from "next/navigation";

export const useSearch = () => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setQuery("");
    setFocused(false);
  }, [pathname]);

  const closeSearch = () => {
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
