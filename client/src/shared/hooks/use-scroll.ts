"use client";
import { useEffect, useRef } from "react";

export const useScroll = (callback: () => void, isActive: boolean) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const handleScroll = () => {
      savedCallback.current();
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isActive]);
};
