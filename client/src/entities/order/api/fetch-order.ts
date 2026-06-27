import { Order } from "@/entities/order/model/types";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export async function fetchOrder(token: string): Promise<Order | null> {
  const res = await fetch(`${API_URL}/order/${token}`, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Order fetch failed: ${res.status}`);

  return res.json();
}
