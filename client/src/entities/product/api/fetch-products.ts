import { Product } from "@/entities/product/model/types";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export interface ProductQueryParams {
  from: string | null;
  to: string | null;
  ingredients: string | null;
  category: string | null;
  sort: string | null;
  page: string | null;
  limit: string | null;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchProducts(
  params: ProductQueryParams,
): Promise<ProductsResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const url = `${API_URL}/product/all?${query.toString()}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);

  return res.json();
}

export function buildProductParams(
  sp: Record<string, string | string[] | undefined>,
): ProductQueryParams {
  const toStr = (v: string | string[] | undefined): string | null => {
    if (v === undefined) return null;
    if (Array.isArray(v)) return v[0] ?? null;
    return v;
  };

  return {
    from: toStr(sp.from),
    to: toStr(sp.to),
    ingredients: toStr(sp.ing),
    category: toStr(sp.category),
    sort: toStr(sp.sort),
    page: toStr(sp.page),
    limit: toStr(sp.limit),
  };
}
