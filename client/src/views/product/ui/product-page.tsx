import type { Product } from "@/entities/product/model/types";
import { Breadcrumbs, Container } from "@/shared/ui";
import { ProductForm } from "@/features/product-configurator/ui/product-form";

interface Props {
  product: Product;
}

export const ProductPage = ({ product }: Props) => {
  return (
    <Container className="flex flex-col my-10">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: product.name },
        ]}
        className="mb-5"
      />
      <ProductForm product={product} />
    </Container>
  );
};
