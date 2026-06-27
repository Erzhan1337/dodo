import {
  fetchProduct,
  isProductNotFoundFetchError,
} from "@/entities/product/api/fetch-product";
import { ProductModal } from "@/widgets/product-modal";
import { notFound } from "next/navigation";

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const product = await fetchProduct(id);
    return <ProductModal product={product} />;
  } catch (error) {
    if (isProductNotFoundFetchError(error)) {
      notFound();
    }

    throw error;
  }
}
