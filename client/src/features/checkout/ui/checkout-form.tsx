"use client";
import { Button, Input } from "@/shared/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckoutFormValues,
  checkoutSchema,
} from "@/features/checkout/model/checkout-schema";
import { useCreateOrder } from "@/features/checkout/api/use-create-order";
import { RecipientSwitch, Recipient } from "@/features/checkout/ui/recipient-switch";
import { useSessionStore } from "@/entities/session/model/store";
import { useState } from "react";

const EMPTY_VALUES: CheckoutFormValues = {
  name: "",
  phone: "",
  address: "",
  email: "",
  comment: "",
};

export const CheckoutForm = () => {
  const user = useSessionStore((state) => state.user);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const { mutate, isPending } = useCreateOrder();

  const buildSelfValues = (): CheckoutFormValues => ({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    email: user?.email ?? "",
    comment: "",
  });

  const [recipient, setRecipient] = useState<Recipient>(
    isAuthenticated ? "self" : "other",
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: isAuthenticated ? buildSelfValues() : EMPTY_VALUES,
  });

  const handleRecipientChange = (next: Recipient) => {
    if (next === recipient) return;
    setRecipient(next);
    reset(next === "self" ? buildSelfValues() : EMPTY_VALUES);
  };

  const onSubmit = (values: CheckoutFormValues) => mutate(values);

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      {isAuthenticated && (
        <RecipientSwitch value={recipient} onChange={handleRecipientChange} />
      )}

      <Input
        label="Имя получателя"
        placeholder="Ваня"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        label="Телефон"
        type="tel"
        placeholder="+7 777 777 77 77"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <Input
        label="Адрес доставки"
        placeholder="Город, улица, дом, квартира"
        {...register("address")}
        error={errors.address?.message}
      />
      <Input
        label="Email (необязательно)"
        placeholder="vanya@gmail.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Комментарий (необязательно)"
        placeholder="Код домофона, этаж, пожелания"
        {...register("comment")}
        error={errors.comment?.message}
      />

      <Button
        type="submit"
        size="xl"
        className="w-full"
        disabled={isPending}
      >
        Подтвердить заказ
      </Button>
    </form>
  );
};
