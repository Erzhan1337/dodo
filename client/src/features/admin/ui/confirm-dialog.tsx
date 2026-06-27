"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui";
import { AdminModal } from "./admin-modal";

type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = "Удалить",
  isPending,
  onCancel,
  onConfirm,
}: Props) => {
  return (
    <AdminModal title={title} isOpen={isOpen} onClose={onCancel}>
      <div className="p-4">
        <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p className="text-foreground">{description}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Выполняется..." : confirmLabel}
          </Button>
        </div>
      </div>
    </AdminModal>
  );
};
