import dynamic from "next/dynamic";

const ProductModal = dynamic(() =>
  import("@/widgets/product-modal").then((m) => m.ProductModal),
);

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductModal id={id} />;
}
