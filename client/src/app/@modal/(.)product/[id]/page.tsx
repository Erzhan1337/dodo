import { ProductModal } from "@/widgets/product-modal";

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductModal id={id} />;
}
