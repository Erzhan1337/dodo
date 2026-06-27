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
    }, 300); // Wait for Framer Motion exit animation
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ProductForm product={product} onSubmit={handleClose} />
    </Modal>
  );
};
