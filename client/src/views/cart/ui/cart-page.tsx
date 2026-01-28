"use client";
import {
  useCart,
  useRemoveCartItem,
  useUpdateItemQuantity,
} from "@/features/cart/api/use-cart";
import { Button, Container, Skeleton, Title } from "@/shared/ui";
import Link from "next/link";
import { CartItem } from "@/features/cart/ui/cart-item";
import { ArrowRight } from "lucide-react";

export const CartPage = () => {
  const { data: cart, isLoading } = useCart();
  const updateQuantity = useUpdateItemQuantity();
  const removeCartItem = useRemoveCartItem();

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity.mutate({ id, quantity });
  };

  const handleRemoveItem = (id: string) => {
    removeCartItem.mutate(id);
  };

  if (isLoading) {
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
      <Title text={`Корзина`} size="xl" className="font-extrabold mb-8" />

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

        <div className="w-112.5">
          <div className="p-8 bg-white rounded-[30px] shadow-lg sticky top-10">
            <div className="flex flex-col gap-1">
              <span className="text-xl text-gray-500">Итого:</span>
              <span className="text-[34px] font-extrabold">
                {cart.totalPrice} ₸
              </span>
            </div>

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
    </Container>
  );
};
