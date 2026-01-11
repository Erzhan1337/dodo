"use client";
import { useEffect, useRef } from "react";

export const useClickOutside = <T extends HTMLElement>(
  callback: () => void,
) => {
  const ref = useRef<T>(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClick = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        savedCallback.current();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  return ref;
};
