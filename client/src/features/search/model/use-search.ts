"use client";

import { useEffect, useRef, useState } from "react";
import {
  useClickOutside,
  useDebounce,
  useEscape,
  useScroll,
} from "@/shared/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useSearch = () => {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(""); // Локальный стейт, не зависим от URL при вводе
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname(); // Следим за путем страницы

  // Дебаунс только для API запроса, а не для URL
  const debouncedQuery = useDebounce(query, 500);

  // 1. Очистка при навигации (Самое важное!)
  // Как только путь меняется (например, перешли на /product/1), мы очищаем поиск.
  useEffect(() => {
    setQuery("");
    setFocused(false);
  }, [pathname]);

  const closeSearch = () => {
    setFocused(false);
    // Не очищаем query здесь, чтобы при случайном клике мимо текст не пропадал,
    // но если хочешь очищать — раскомментируй:
    // setQuery("");
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
