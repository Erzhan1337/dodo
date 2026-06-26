import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  compact?: boolean;
  className?: string;
}

export const QueryErrorState = ({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
  compact = false,
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center text-center",
        compact ? "px-5 py-4" : "min-h-80 px-6 py-10",
        className,
      )}
    >
      <AlertCircle
        className={cn("text-primary", compact ? "size-5" : "size-8")}
      />
      <h2
        className={cn(
          "mt-3 font-extrabold",
          compact ? "text-base" : "text-2xl",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-2 text-muted-foreground",
            compact ? "text-sm" : "max-w-md",
          )}
        >
          {description}
        </p>
      )}
      {onAction && actionLabel && (
        <Button
          type="button"
          size={compact ? "sm" : "lg"}
          className="mt-5 px-6"
          disabled={actionDisabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
