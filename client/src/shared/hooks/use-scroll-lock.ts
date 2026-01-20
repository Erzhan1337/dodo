"use client";
import { useCallback, useLayoutEffect, useRef } from "react";

export const useScrollLock = (enabled: boolean = true) => {
  const scrollBlocked = useRef(false);
  const originalStyles = useRef("");

  const lockScroll = useCallback(() => {
    if (scrollBlocked.current) return;

    originalStyles.current = document.body.style.overflow;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    scrollBlocked.current = true;
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollBlocked.current) return;

    document.body.style.overflow = originalStyles.current;
    document.body.style.paddingRight = "";
    scrollBlocked.current = false;
  }, []);

  useLayoutEffect(() => {
    if (enabled) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [enabled, lockScroll, unlockScroll]);

  return { lockScroll, unlockScroll };
};
