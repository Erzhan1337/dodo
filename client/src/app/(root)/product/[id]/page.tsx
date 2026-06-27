import {
  fetchProduct,
  isProductNotFoundFetchError,
} from "@/entities/product/api/fetch-product";
import { ProductPage } from "@/views/product/ui/product-page";
import { notFound } from "next/navigation";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const product = await fetchProduct(id);
    return <ProductPage product={product} />;
  } catch (error) {
    if (isProductNotFoundFetchError(error)) {
      notFound();
    }

    throw error;
  }
}

export default Page;
