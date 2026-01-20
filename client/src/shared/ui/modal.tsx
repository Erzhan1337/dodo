"use client";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { useEscape, useScrollLock } from "@/shared/hooks";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Props {
  className?: string;
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
}

export const Modal = ({
  children,
  onClose,
  isOpen = true,
  className,
}: Props) => {
  const [mounted, setMounted] = useState(false);
  useScrollLock(isOpen);
  useEscape(onClose || (() => {}));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          {/*Overlay*/}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/*Content*/}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "max-w-250 z-60 relative w-full overflow-hidden",
              className,
            )}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 text-primary hover:scale-120 transition-transform duration-300 cursor-pointer"
            >
              <X className="size-5 stroke-3" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
