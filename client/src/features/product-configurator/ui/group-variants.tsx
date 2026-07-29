import { cn } from "@/shared/lib/utils";
import { LazyMotion, m } from "framer-motion";
import { loadMotionFeatures } from "@/shared/lib/motion";
import { useId } from "react";

type Variant = {
  name: string;
  value: number;
  disabled?: boolean;
};

interface Props {
  items: Variant[];
  onClick?: (value: Variant["value"]) => void;
  className?: string;
  value?: Variant["value"];
  compact?: boolean;
}

export const GroupVariants = ({
  items,
  onClick,
  className,
  value,
  compact = false,
}: Props) => {
  const uniqueId = useId();
  return (
    <LazyMotion features={loadMotionFeatures}>
      <div
        className={cn(
          "flex items-center justify-between rounded-2xl p-1 select-none bg-[#ECECEC] shadow",
          compact && "rounded-xl p-0.5 lg:rounded-2xl lg:p-1",
          className,
        )}
      >
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onClick?.(item.value)}
            className={cn(
              "text-sm w-full py-2 cursor-pointer rounded-2xl relative",
              compact &&
                "rounded-xl py-1.5 text-xs lg:rounded-2xl lg:py-2 lg:text-sm",
              item.value === value && "bg-white",
              item.disabled && "opacity-75 pointer-events-none",
            )}
          >
            {item.value === value && (
              <m.div
                layoutId={uniqueId}
                className={cn(
                  "absolute inset-0 rounded-2xl bg-white shadow-md",
                  compact && "rounded-xl lg:rounded-2xl",
                )}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.name}</span>
          </button>
        ))}
      </div>
    </LazyMotion>
  );
};
