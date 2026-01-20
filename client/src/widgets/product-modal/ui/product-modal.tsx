"use client";
import { Modal } from "@/shared/ui";
import { ProductForm } from "@/features/product-configurator/ui/product-form";
import { getProduct } from "@/entities/product";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

export const ProductModal = ({ id }: Props) => {
  const { data: product, isLoading } = getProduct(id);
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!product) {
    return <div>product not found</div>;
  }
  return (
    <Modal isOpen={true} onClose={handleClose}>
      <ProductForm product={product} />
    </Modal>
  );
};
