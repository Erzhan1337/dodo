"use client";
import Link from "next/link";
import { Breadcrumbs, Button, Container, Title } from "@/shared/ui";
import { useCart } from "@/features/cart/api/use-cart";
import { useSessionStore } from "@/entities/session/model/store";
import { formatPrice } from "@/shared/lib/format-price";
import { CheckoutForm } from "@/features/checkout";
import { CartPageSkeleton } from "@/views/cart/ui/cart-page-skeleton";

export const CheckoutPage = () => {
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const { data: cart, isLoading } = useCart();

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
                const linePrice =
                  (item.productItem.price + ingredientsPrice) * item.quantity;

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

            <div className="flex items-center justify-between">
              <span className="text-xl text-gray-500">Итого:</span>
              <span className="text-2xl font-extrabold">
                {formatPrice(cart.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
