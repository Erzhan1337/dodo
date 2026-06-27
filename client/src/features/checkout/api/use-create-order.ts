import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { $api } from "@/shared/api";
import { CART_QUERY_KEY } from "@/entities/cart/model/query-key";
import { ORDERS_QUERY_KEY } from "@/entities/order/api/use-orders";
import type { CheckoutFormValues } from "@/features/checkout/model/checkout-schema";
import toast from "react-hot-toast";

export const useCreateOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CheckoutFormValues) => {
      const { data } = await $api.post<{ token: string }>("/order", values);
      return data;
    },
    onSuccess: ({ token }) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success("Заказ оформлен!");
      router.push(`/order/${token}`);
    },
  });
};
