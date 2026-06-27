"use client";

import { useSessionStore } from "@/entities/session/model/store";
import { AuthButton } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { Skeleton } from "@/shared/ui";

export const HeaderActions = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center gap-2 md:gap-3">
        <Skeleton className="h-7 w-16 md:h-9 md:w-20 lg:h-11 lg:w-28" />
        <Skeleton className="h-7 w-24 md:h-9 md:w-32 lg:h-11 lg:w-40" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <AuthButton />
      <CartButton />
    </div>
  );
};
