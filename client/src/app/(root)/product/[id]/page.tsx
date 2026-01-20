import { ProductPage } from "@/views/product/ui/product-page";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductPage id={id} />;
}

export default Page;
