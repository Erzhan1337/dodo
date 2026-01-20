import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
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
}

export const GroupVariants = ({ items, onClick, className, value }: Props) => {
  const uniqueId = useId();
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl p-1 select-none bg-[#ECECEC] shadow",
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
            item.value === value && "bg-white",
            item.disabled && "opacity-75 pointer-events-none",
          )}
        >
          {item.value === value && (
            <motion.div
              layoutId={uniqueId}
              className="absolute inset-0 bg-white shadow-md rounded-2xl"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </button>
      ))}
    </div>
  );
};
