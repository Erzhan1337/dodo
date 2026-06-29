"use client";

import { MouseEvent } from "react";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { useSessionStore } from "@/entities/session/model/store";
import type { Product } from "@/entities/product";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import {
  useIsFavoriteProduct,
  useToggleFavoriteProduct,
} from "@/features/favorites/api/use-favorites";

type Props = {
  productId: string;
  productName?: string;
  product?: Product;
  showLabel?: boolean;
  className?: string;
};

export const FavoriteButton = ({
  productId,
  productName,
  product,
  showLabel = false,
  className,
}: Props) => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const { isFavorite, isLoading } = useIsFavoriteProduct(productId);
  const toggleFavorite = useToggleFavoriteProduct();
  const disabled =
    !_hasHydrated ||
    toggleFavorite.isPending ||
    (isAuthenticated && isLoading);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!_hasHydrated || toggleFavorite.isPending) return;

    if (!isAuthenticated) {
      toast.error("Войдите, чтобы добавлять товары в избранное");
      return;
    }

    toggleFavorite.mutate({
      productId,
      productName,
      product,
      nextFavorite: !isFavorite,
    });
  };

  if (showLabel) {
    return (
      <Button
        type="button"
        size="sm"
        variant={isFavorite ? "default" : "outline"}
        disabled={disabled}
        aria-pressed={isFavorite}
        onClick={handleClick}
        className={cn("gap-2 rounded-xl px-3", className)}
      >
        <Heart
          className={cn("size-4", isFavorite && "fill-current")}
          strokeWidth={2.2}
        />
        {isFavorite ? "В избранном" : "В избранное"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={disabled}
      aria-label={
        isFavorite
          ? `Убрать ${productName ?? "товар"} из избранного`
          : `Добавить ${productName ?? "товар"} в избранное`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? "Убрать из избранного" : "В избранное"}
      onClick={handleClick}
      className={cn(
        "rounded-full bg-white text-primary shadow-md transition-transform hover:scale-95 hover:bg-white",
        isFavorite && "bg-primary text-white hover:bg-primary",
        className,
      )}
    >
      <Heart className={cn("size-4", isFavorite && "fill-current")} />
    </Button>
  );
};
