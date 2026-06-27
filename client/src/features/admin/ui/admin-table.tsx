"use client";

import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { ReactNode } from "react";
import { Button, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { SortOrder } from "@/features/admin/model/types";

export type AdminTableColumn<T> = {
  id: string;
  header: string;
  sortKey?: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

type Props<T> = {
  columns: AdminTableColumn<T>[];
  rows?: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  emptyTitle?: string;
  currentSortBy?: string;
  currentSortOrder?: SortOrder;
  onSort?: (sortBy: string) => void;
  onRetry?: () => void;
};

export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  emptyTitle = "Данных нет",
  currentSortBy,
  currentSortOrder,
  onSort,
  onRetry,
}: Props<T>) {
  if (isError) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 border-t border-border px-6 py-10 text-center">
        <AlertCircle className="size-7 text-destructive" />
        <p className="font-semibold">Не удалось загрузить данные</p>
        {onRetry && (
          <Button type="button" variant="outline" onClick={onRetry}>
            Повторить
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
          <tr>
            {columns.map((column) => {
              const isSorted = currentSortBy === column.sortKey;
              return (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "border-b border-border px-4 py-3 font-bold",
                    column.className,
                  )}
                >
                  {column.sortKey && onSort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => onSort(column.sortKey as string)}
                    >
                      {column.header}
                      {isSorted ? (
                        currentSortOrder === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 8 }, (_, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.id} className="border-b border-border px-4 py-3">
                    <Skeleton className="h-5 w-full max-w-40 rounded-md" />
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading &&
            rows?.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-muted/35">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "border-b border-border px-4 py-3 align-middle",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {!isLoading && rows?.length === 0 && (
        <div className="flex min-h-60 items-center justify-center border-b border-border px-6 py-10 text-center text-muted-foreground">
          {emptyTitle}
        </div>
      )}
    </div>
  );
}
