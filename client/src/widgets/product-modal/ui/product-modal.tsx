"use client";
import { Modal } from "@/shared/ui";
import { ProductForm } from "@/features/product-configurator/ui/product-form";
import { getProduct } from "@/entities/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  id: string;
}

export const ProductModal = ({ id }: Props) => {
  const { data: product, isLoading } = getProduct(id);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 300); // Wait for Framer Motion exit animation
  };

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!product) {
    return <div>product not found</div>;
  }
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ProductForm product={product} onSubmit={handleClose} />
    </Modal>
  );
};
