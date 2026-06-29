"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TicketPercent, X } from "lucide-react";
import { Breadcrumbs, Button, Container, Title } from "@/shared/ui";
import {
  useApplyPromoCode,
  useCart,
  usePromoCodes,
  useRemovePromoCode,
} from "@/features/cart/api/use-cart";
import { useSessionStore } from "@/entities/session/model/store";
import { formatPrice } from "@/shared/lib/format-price";
import { CheckoutForm } from "@/features/checkout";
import { CartPageSkeleton } from "@/views/cart/ui/cart-page-skeleton";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const CheckoutPage = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const { data: cart, isLoading } = useCart();
  const { data: promoCodes = [] } = usePromoCodes();
  const applyPromoCode = useApplyPromoCode();
  const removePromoCode = useRemovePromoCode();
  const [promoCodeValue, setPromoCodeValue] = useState("");
  const promoActionPending = applyPromoCode.isPending || removePromoCode.isPending;

  useEffect(() => {
    setPromoCodeValue(cart?.promoCode?.code ?? "");
  }, [cart?.promoCode?.code]);

  const handleApplyPromoCode = (
    event?: FormEvent<HTMLFormElement>,
    suggestedCode?: string,
  ) => {
    event?.preventDefault();

    const code = (suggestedCode ?? promoCodeValue).trim();
    if (!code) {
      toast.error("Введите промокод");
      return;
    }

    applyPromoCode.mutate(code, {
      onSuccess: ({ cart: nextCart }) => {
        setPromoCodeValue(nextCart.promoCode?.code ?? code.toUpperCase());
        toast.success("Промокод применен");
      },
      onError: handleApiError,
    });
  };

  const handleRemovePromoCode = () => {
    removePromoCode.mutate(undefined, {
      onSuccess: () => {
        setPromoCodeValue("");
        toast.success("Промокод удален");
      },
      onError: handleApiError,
    });
  };

  if (!_hasHydrated || isLoading) {
    return <CartPageSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="mt-20 flex flex-col items-center justify-center">
        <Title text="Корзина пуста" size="lg" className="font-extrabold" />
        <p className="mb-5 text-gray-500">Добавьте пиццу, чтобы оформить заказ</p>
        <Link href="/">
          <Button size="lg">Вернуться в меню</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="mt-10 pb-20">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Корзина", href: "/cart" },
          { label: "Оформление" },
        ]}
        className="mb-5"
      />
      <Title text="Оформление заказа" className="mb-8 text-2xl lg:text-3xl" />

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <div className="rounded-[30px] bg-white p-6 shadow-lg md:p-8">
            <CheckoutForm />
          </div>
        </div>

        <div className="lg:w-110">
          <div className="sticky top-10 rounded-[30px] bg-white p-8 shadow-lg">
            <h3 className="mb-5 text-xl font-bold">Ваш заказ</h3>
            <div className="flex flex-col gap-4">
              {cart.items.map((item) => {
                const ingredientsPrice = item.ingredients.reduce(
                  (sum, ing) => sum + ing.price,
                  0,
                );
                const unitPrice =
                  item.customUnitPrice ??
                  item.productItem.price + ingredientsPrice;
                const linePrice =
                  unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="text-gray-600">
                      {item.productItem.product.name}
                      <span className="text-gray-400"> × {item.quantity}</span>
                    </span>
                    <span className="whitespace-nowrap font-semibold">
                      {formatPrice(linePrice)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="my-5 border-b border-gray-100" />

            <div className="space-y-4">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <TicketPercent className="size-4 text-primary" />
                  Промокод
                </div>

                <form
                  className="flex gap-2"
                  onSubmit={(event) => handleApplyPromoCode(event)}
                >
                  <input
                    value={promoCodeValue}
                    onChange={(event) =>
                      setPromoCodeValue(event.target.value.toUpperCase())
                    }
                    placeholder="PIZZA10"
                    disabled={promoActionPending}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 text-sm font-bold uppercase outline-none transition-colors placeholder:text-zinc-300 focus:border-primary"
                  />
                  {cart.promoCode ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={promoActionPending}
                      onClick={handleRemovePromoCode}
                      className="h-11 rounded-xl px-3"
                    >
                      <X className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={promoActionPending}
                      className="h-11 rounded-xl px-4 text-sm font-bold"
                    >
                      Применить
                    </Button>
                  )}
                </form>

                {cart.promoCode && (
                  <div className="mt-2 text-sm text-gray-500">
                    {cart.promoCode.title}
                  </div>
                )}

                {promoCodes.length > 0 && !cart.promoCode && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                    {promoCodes.slice(0, 4).map((promoCode) => (
                      <button
                        key={promoCode.id}
                        type="button"
                        disabled={promoActionPending}
                        onClick={() =>
                          handleApplyPromoCode(undefined, promoCode.code)
                        }
                        className="flex w-full cursor-pointer items-start justify-between gap-3 text-left text-sm transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                      >
                        <span>
                          <span className="font-extrabold">
                            {promoCode.code}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {promoCode.description}
                          </span>
                        </span>
                        {promoCode.minOrderAmount > 0 && (
                          <span className="shrink-0 text-xs font-semibold text-gray-400">
                            от {formatPrice(promoCode.minOrderAmount)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                {cart.discountAmount > 0 && (
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Товары:</span>
                    <span className="font-semibold">
                      {formatPrice(cart.subtotalPrice)}
                    </span>
                  </div>
                )}

                {cart.discountAmount > 0 && (
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Скидка
                      {cart.promoCode ? ` ${cart.promoCode.code}` : ""}:
                    </span>
                    <span className="font-bold text-primary">
                      -{formatPrice(cart.discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xl text-gray-500">Итого:</span>
                  <span className="text-2xl font-extrabold">
                    {formatPrice(cart.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
