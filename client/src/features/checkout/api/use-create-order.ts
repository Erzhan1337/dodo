import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { $api } from "@/shared/api";
import { CART_QUERY_KEY } from "@/entities/cart/model/query-key";
import { ORDERS_QUERY_KEY } from "@/entities/order/api/use-orders";
import type { CheckoutFormValues } from "@/features/checkout/model/checkout-schema";
import toast from "react-hot-toast";
import { handleApiError } from "@/shared/lib/handle-api-error";

type CreateOrderResponse = {
  token: string;
};

type CreateCheckoutResponse = {
  paymentUrl: string;
};

type CreateOrderWithCheckoutResponse = CreateOrderResponse & {
  paymentUrl?: string;
};

export const useCreateOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      values: CheckoutFormValues,
    ): Promise<CreateOrderWithCheckoutResponse> => {
      const { data: order } = await $api.post<CreateOrderResponse>(
        "/order",
        values,
      );

      try {
        const { data: checkout } = await $api.post<CreateCheckoutResponse>(
          `/payments/orders/${order.token}/checkout`,
        );

        return { ...order, paymentUrl: checkout.paymentUrl };
      } catch (error) {
        handleApiError(error);
        return order;
      }
    },
    onSuccess: ({ token, paymentUrl }) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });

      if (paymentUrl) {
        toast.success("Заказ оформлен. Переходим к оплате.");
        window.location.assign(paymentUrl);
        return;
      }

      toast.success(
        "Заказ оформлен. Оплату можно повторить на странице заказа.",
      );
      router.push(`/order/${token}`);
    },
    onError: handleApiError,
  });
};
