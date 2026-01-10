"use client";
import { Button, Input } from "@/shared/ui";
import { useForm } from "react-hook-form";
import {
  RegisterFormValues,
  registerSchema,
} from "@/features/auth/model/register-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/features/auth/api/use-register";
import { useSessionStore } from "@/entities/session/model/store";

export const RegisterForm = () => {
  const router = useRouter();
  const setAuthData = useSessionStore((state) => state.setAuthData);
  const { mutate, isPending } = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutate(data, {
      onSuccess: (response) => {
        setAuthData(response.user, response.accessToken);
        router.push("/");
      },
    });
  };
  return (
    <form
      className="w-[70%] flex flex-col gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        label="Имя"
        placeholder="Ваня"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        label="*Email"
        placeholder="vanya@gmail.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Номер"
        placeholder="+7 777 777 77 77"
        type="tel"
        {...register("phone")}
        error={errors.phone?.message}
      />
      <Input
        label="Пароль"
        placeholder="Пароль"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />

      <Button type="submit" className="w-full" size="xl" disabled={isPending}>
        Создать
      </Button>
    </form>
  );
};
