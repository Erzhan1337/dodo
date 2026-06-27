"use client";
import { cn } from "@/shared/lib/utils";
import { LazyMotion, m } from "framer-motion";
import { loadMotionFeatures } from "@/shared/lib/motion";

export type Recipient = "self" | "other";

interface Props {
  value: Recipient;
  onChange: (value: Recipient) => void;
  className?: string;
}

const options: { value: Recipient; label: string }[] = [
  { value: "self", label: "Себе" },
  { value: "other", label: "Другу" },
];

export const RecipientSwitch = ({ value, onChange, className }: Props) => {
  return (
    <LazyMotion features={loadMotionFeatures}>
      <div
        className={cn(
          "flex w-full items-center gap-1 rounded-2xl bg-gray-50 p-1 shadow-md",
          className,
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex-1 cursor-pointer py-2 text-center text-sm md:text-base",
              value === option.value ? "text-primary" : "hover:text-primary",
            )}
          >
            {value === option.value && (
              <m.div
                layoutId="activeRecipient"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: -1 }}
                className="absolute inset-0 rounded-xl bg-white shadow-md md:rounded-2xl"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        ))}
      </div>
    </LazyMotion>
  );
};
