"use client";
import { Button, Input } from "@/shared/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProfileFormValues,
  profileSchema,
} from "@/features/profile/model/profile-schema";
import {
  useProfile,
  useUpdateProfile,
} from "@/features/profile/api/use-profile";
import { useSessionStore } from "@/entities/session/model/store";

export const ProfileForm = () => {
  const sessionUser = useSessionStore((state) => state.user);
  const { data, isLoading } = useProfile();
  const { mutate, isPending } = useUpdateProfile();

  const user = data ?? sessionUser;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      address: user?.address ?? "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => mutate(values);

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Имя" {...register("name")} error={errors.name?.message} />

      <Input
        label="Телефон"
        value={user?.phone ?? ""}
        readOnly
        className="bg-zinc-50 text-zinc-500"
      />

      <Input
        label="Email"
        value={user?.email ?? "—"}
        readOnly
        className="bg-zinc-50 text-zinc-500"
      />

      <Input
        label="Адрес доставки"
        placeholder="Город, улица, дом, квартира"
        {...register("address")}
        error={errors.address?.message}
      />

      <Button
        type="submit"
        size="xl"
        className="w-full"
        disabled={isPending || isLoading}
      >
        Сохранить
      </Button>
    </form>
  );
};
