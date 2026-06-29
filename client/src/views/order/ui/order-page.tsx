"use client";

import Link from "next/link";
import { CheckCircle2, CreditCard } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Breadcrumbs, Button, Container, Title } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/format-price";
import {
  canPayOrder,
  createOrderCheckout,
  getOrderDisplayStatus,
  useRealtimeOrderStatus,
  type Order,
} from "@/entities/order";
import { handleApiError } from "@/shared/lib/handle-api-error";

const formatOrderNumber = (value: number) => String(value).padStart(6, "0");

export const OrderPage = ({ order: initialOrder }: { order: Order }) => {
  const order = useRealtimeOrderStatus(initialOrder);
  const status = getOrderDisplayStatus(order);
  const orderNumber = formatOrderNumber(order.orderNumber);
  const canPay = canPayOrder(order);
  const paymentMutation = useMutation({
    mutationFn: () => createOrderCheckout(order.token),
    onSuccess: ({ paymentUrl }) => window.location.assign(paymentUrl),
    onError: handleApiError,
  });

  return (
    <Container className="mt-10 max-w-3xl pb-20">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Заказ" }]}
        className="mb-5"
      />

      <div className="rounded-[30px] bg-white p-6 shadow-lg md:p-10">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="mb-3 size-14 text-primary" />
          <Title text="Заказ оформлен!" className="text-2xl lg:text-3xl" />
          <p className="mt-2 text-gray-500">Номер заказа №{orderNumber}</p>
          <span
            className={cn(
              "mt-3 rounded-full px-4 py-1 text-sm font-medium",
              status.className,
            )}
          >
            {status.text}
          </span>
        </div>

        <div className="my-8 border-b border-gray-100" />

        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0 text-gray-700">
                <div>
                  {item.customName || item.productItem.product.name}
                  <span className="text-gray-400"> × {item.quantity}</span>
                </div>
                {item.customDetails && (
                  <>
                    <div className="mt-1 text-xs text-gray-400">
                      {item.productItem.size} см,{" "}
                      {item.productItem.pizzaType === 1
                        ? "традиционное"
                        : "тонкое"}{" "}
                      тесто · {item.customDetails.sauce}
                      {item.customDetails.format === "halves" &&
                        " · две половинки"}
                    </div>
                    {item.customDetails.halfAndHalf && (
                      <div className="mt-1 text-xs font-semibold text-primary">
                        Левая:{" "}
                        {item.customDetails.halfAndHalf.leftProduct.name} ·
                        Правая:{" "}
                        {item.customDetails.halfAndHalf.rightProduct.name}
                      </div>
                    )}
                  </>
                )}
              </div>
              <span className="whitespace-nowrap font-semibold">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-6 flex items-center justify-between">
          <span className="text-lg text-gray-500">Итого:</span>
          <span className="text-2xl font-extrabold">
            {formatPrice(order.totalPrice)}
          </span>
        </div>

        {canPay && (
          <div className="mb-6 rounded-2xl border border-orange-100 bg-[#FFFDF9] p-5 text-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-bold">Оплата онлайн</h4>
                <p className="mt-1 text-gray-500">
                  После оплаты статус заказа обновится автоматически.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                className="gap-2"
                disabled={paymentMutation.isPending}
                onClick={() => paymentMutation.mutate()}
              >
                <CreditCard className="size-4" />
                Оплатить
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[#FFF7EE] p-5 text-sm">
          <h4 className="mb-3 font-bold">Доставка</h4>
          <dl className="flex flex-col gap-1 text-gray-600">
            <div className="flex gap-2">
              <dt className="text-gray-400">Получатель:</dt>
              <dd>{order.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Телефон:</dt>
              <dd>{order.phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400">Адрес:</dt>
              <dd>{order.address}</dd>
            </div>
            {order.comment && (
              <div className="flex gap-2">
                <dt className="text-gray-400">Комментарий:</dt>
                <dd>{order.comment}</dd>
              </div>
            )}
          </dl>
        </div>

        <Link href="/" className="mt-8 block">
          <Button size="xl" className="w-full">
            Вернуться в меню
          </Button>
        </Link>
      </div>
    </Container>
  );
};
