"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSessionStore } from "@/entities/session/model/store";
import { useFavoriteProductIds } from "@/features/favorites/api/use-favorites";

export const FavoritesHeaderLink = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const { data } = useFavoriteProductIds();
  const count = data?.ids.length ?? 0;

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/favorites"
      aria-label="Избранное"
      className="relative hidden h-9 items-center justify-center rounded-md border border-zinc-200 px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary md:inline-flex lg:h-11 lg:rounded-2xl"
    >
      <Heart className="size-4" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-extrabold leading-5 text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
};
