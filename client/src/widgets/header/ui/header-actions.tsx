"use client";

import { useSessionStore } from "@/entities/session/model/store";
import { AuthButton } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { Skeleton } from "@/shared/ui";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export const HeaderActions = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const user = useSessionStore((state) => state.user);

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
      {user?.role === "ADMIN" && (
        <Link
          href="/admin"
          prefetch={false}
          aria-label="Админ-панель"
          className="hidden h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary md:inline-flex"
        >
          <ShieldCheck className="size-4" />
          Админка
        </Link>
      )}
      <AuthButton />
      <CartButton />
    </div>
  );
};
