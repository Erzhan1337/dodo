import type { Product } from "@/entities/product/model/types";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product "${productId}" was not found`);
    this.name = "ProductNotFoundError";
  }
}

export async function fetchProduct(id: string): Promise<Product> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_SERVER_URL is not configured");
  }

  const res = await fetch(`${API_URL}/product/${encodeURIComponent(id)}`);

  if (res.status === 404) {
    throw new ProductNotFoundError(id);
  }

  if (!res.ok) {
    throw new Error(`Product fetch failed: ${res.status}`);
  }

  return res.json();
}

export function isProductNotFoundFetchError(
  error: unknown,
): error is ProductNotFoundError {
  return error instanceof ProductNotFoundError;
}
