"use client";
import type { Product } from "@/entities/product/model/types";
import { ProductForm } from "@/features/product-configurator/ui/product-form";
import { Modal } from "@/shared/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  product: Product;
}

export const ProductModal = ({ product }: Props) => {
  const { back } = useRouter();
  const [isOpen, setIsOpen] = useState(true);

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
      className="max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-250 overflow-y-auto rounded-3xl sm:max-h-[calc(100dvh-48px)] sm:w-[calc(100vw-48px)]"
    >
      <ProductForm product={product} onSubmit={handleClose} />
    </Modal>
  );
};
