"use client";
import type { Product } from "@/entities/product/model/types";
import { ProductForm } from "@/features/product-configurator/ui/product-form";
import { ProductReviews } from "@/features/reviews";
import { loadMotionFeatures } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { Modal } from "@/shared/ui";
import { LazyMotion, m } from "framer-motion";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

interface Props {
  product: Product;
}

const tabs = [
  { value: "config", label: "Настроить" },
  { value: "reviews", label: "Отзывы" },
] as const;

export const ProductModal = ({ product }: Props) => {
  const { back } = useRouter();
  const tabLayoutId = useId();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"config" | "reviews">("config");

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      back();
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="h-[calc(100dvh-24px)] max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-250 overflow-hidden rounded-3xl sm:h-[calc(100dvh-48px)] sm:max-h-[calc(100dvh-48px)] sm:w-[calc(100vw-48px)] lg:h-[760px]"
    >
      <ProductForm
        product={product}
        onSubmit={handleClose}
        className="h-full max-h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:overflow-hidden [&::-webkit-scrollbar]:hidden"
        rightHeader={
          <LazyMotion features={loadMotionFeatures}>
            <div className="grid w-full grid-cols-2 rounded-xl bg-[#ECECEC] p-0.5 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "relative min-h-8 rounded-lg px-3 text-xs font-bold transition-colors sm:text-sm",
                    activeTab === tab.value
                      ? "text-primary"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  {activeTab === tab.value && (
                    <m.div
                      layoutId={tabLayoutId}
                      className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </LazyMotion>
        }
        rightContent={
          activeTab === "reviews" ? (
            <ProductReviews productId={product.id} variant="modal" />
          ) : undefined
        }
      />
    </Modal>
  );
};
