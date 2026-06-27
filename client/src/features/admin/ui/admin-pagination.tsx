"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui";
import type { PaginationMeta } from "@/features/admin/model/types";

type Props = {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
};

export const AdminPagination = ({ meta, onPageChange }: Props) => {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, index) => index + 1)
    .filter((page) => {
      return (
        page === 1 ||
        page === meta.totalPages ||
        Math.abs(page - meta.page) <= 1
      );
    });

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm"
      aria-label="Пагинация"
    >
      <span className="text-muted-foreground">
        {meta.total === 0
          ? "Нет записей"
          : `${(meta.page - 1) * meta.limit + 1}-${Math.min(
              meta.page * meta.limit,
              meta.total,
            )} из ${meta.total}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={meta.page <= 1}
          aria-label="Предыдущая страница"
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((page, index) => {
          const previous = pages[index - 1];
          const showGap = previous !== undefined && page - previous > 1;
          return (
            <div key={page} className="flex items-center gap-1">
              {showGap && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                type="button"
                size="icon-sm"
                variant={page === meta.page ? "default" : "ghost"}
                aria-current={page === meta.page ? "page" : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          disabled={meta.page >= meta.totalPages}
          aria-label="Следующая страница"
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
};
