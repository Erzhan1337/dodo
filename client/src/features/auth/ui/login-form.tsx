"use client";
import { Input } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  LoginFormValues,
  loginSchema,
} from "@/features/auth/model/login-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/features/auth/api/use-login";

export const LoginForm = () => {
  const router = useRouter();
  const { mutate, isPending } = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    mutate(data, {
      onSuccess: () => {
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
        label="Номер"
        placeholder="+7 777 777 77 77"
        type="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Input
        label="Пароль"
        placeholder="Пароль"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" className="w-full" size="xl" disabled={isPending}>
        Войти
      </Button>
    </form>
  );
};
