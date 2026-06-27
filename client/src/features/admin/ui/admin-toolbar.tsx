"use client";

import { Plus, Search } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/shared/ui";

type Props = {
  title: string;
  description?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export const AdminToolbar = ({
  title,
  description,
  searchValue,
  searchPlaceholder = "Поиск",
  onSearchChange,
  actionLabel,
  onAction,
  children,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-extrabold text-foreground md:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {onSearchChange && (
          <label className="relative block">
            <span className="sr-only">{searchPlaceholder}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 sm:w-68"
            />
          </label>
        )}
        {children}
        {actionLabel && onAction && (
          <Button type="button" onClick={onAction} className="gap-2 px-4">
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
