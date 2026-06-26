"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCart,
  useRemoveCartItem,
  useUpdateItemQuantity,
} from "@/features/cart/api/use-cart";
import { Button, Breadcrumbs, Container, Skeleton, Title } from "@/shared/ui";
import { formatPrice } from "@/shared/lib/format-price";
import Link from "next/link";
import { CartItem } from "@/features/cart/ui/cart-item";
import { ArrowRight } from "lucide-react";
import { useSessionStore } from "@/entities/session/model/store";

export const CartPage = () => {
  const router = useRouter();
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const { data: cart, isLoading } = useCart();
  const updateQuantity = useUpdateItemQuantity();
  const removeCartItem = useRemoveCartItem();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity.mutate({ id, quantity });
  };

  const handleRemoveItem = (id: string) => {
    removeCartItem.mutate(id);
  };

  if (!_hasHydrated || !isAuthenticated || isLoading) {
    return (
      <Container className="mt-10">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="flex flex-col items-center justify-center mt-20">
        <Title text="Корзина пуста" size="lg" className="font-extrabold" />
        <p className="text-gray-500 mb-5">
          Добавьте пиццу, чтобы совершить заказ
        </p>
        <Link href="/">
          <Button size="lg">Вернуться назад</Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="mt-10 pb-20">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Корзина" },
        ]}
        className="mb-5"
      />
      <div className="text-xl md:text-2xl lg:text-3xl mb-10 font-bold">
        Корзина
      </div>
      <div className="flex gap-10">
        <div className="flex flex-col gap-5 flex-1">
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onClickCountButton={handleUpdateQuantity}
              onClickRemove={handleRemoveItem}
            />
          ))}
        </div>
        <div className="hidden lg:block md:w-110">
          <div className="p-8 bg-white rounded-[30px] shadow-lg sticky top-10">
            <div className="flex flex-col gap-1">
              <span className="text-xl text-gray-500">Итого:</span>
              <span className="text-[34px] font-extrabold">
                {formatPrice(cart.totalPrice)}
              </span>

              <div className="border-b border-gray-100 my-5" />

              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-bold h-14"
              >
                Оформить заказ
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="block md:hidden mt-10 w-full text-white px-4">
        <button
          type="button"
          className="bg-primary py-3 px-4 w-full rounded-xl cursor-pointer"
        >
          {`Оформить заказ на ${formatPrice(cart.totalPrice)}`}
        </button>
      </div>
    </Container>
  );
};
