import { $api } from "@/shared/api";

type CreateCheckoutResponse = {
  paymentUrl: string;
};

export async function createOrderCheckout(token: string) {
  const { data } = await $api.post<CreateCheckoutResponse>(
    `/payments/orders/${token}/checkout`,
  );

  return data;
}
