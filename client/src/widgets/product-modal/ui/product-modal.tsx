"use client";
import { Modal, Skeleton } from "@/shared/ui";
import { ProductForm } from "@/features/product-configurator/ui/product-form";
import { useProduct } from "@/entities/product";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  id: string;
}

export const ProductModal = ({ id }: Props) => {
  const { data: product, isLoading } = useProduct(id);
  const { back } = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      back();
    }, 300); // Wait for Framer Motion exit animation
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="w-full lg:w-[50%] flex items-center justify-center bg-white lg:rounded-tl-3xl lg:rounded-bl-3xl p-10 min-h-[300px] lg:min-h-[500px]">
            <Skeleton className="w-60 h-60 lg:w-85 lg:h-85 rounded-full" />
          </div>
          <div className="bg-[#F4F1EE] w-full lg:w-[50%] lg:rounded-tr-3xl lg:rounded-br-3xl py-5 px-10 flex flex-col">
            <Skeleton className="h-8 w-2/3 mb-5" />
            <Skeleton className="h-10 w-full rounded-2xl mb-3" />
            <Skeleton className="h-10 w-full rounded-2xl mb-5" />

            <Skeleton className="h-6 w-1/2 mb-3" />
            <div className="gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 h-45 lg:h-90 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((id) => (
                <Skeleton
                  key={id}
                  className="h-28 w-full rounded-2xl shrink-0"
                />
              ))}
            </div>

            <Skeleton className="h-14 w-full rounded-2xl mt-5" />
          </div>
        </div>
      </Modal>
    );
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
