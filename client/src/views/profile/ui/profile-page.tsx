"use client";
import { Breadcrumbs, Container, Title } from "@/shared/ui";
import { ProfileForm } from "@/features/profile";
import { useSessionStore } from "@/entities/session/model/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProfilePage = () => {
  const router = useRouter();
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const authStatus = useSessionStore((state) => state.status);

  useEffect(() => {
    if (_hasHydrated && authStatus === "anonymous") {
      router.replace("/login");
    }
  }, [_hasHydrated, authStatus, router]);

  if (
    !_hasHydrated ||
    authStatus === "bootstrapping" ||
    authStatus === "unavailable" ||
    !isAuthenticated
  ) {
    return null;
  }

  return (
    <Container className="mt-10 max-w-xl pb-20">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Настройки" }]}
        className="mb-5"
      />
      <Title text="Настройки" className="mb-2 text-2xl lg:text-3xl" />
      <p className="mb-8 text-gray-500">
        Сохраните адрес — тогда при заказе «Себе» он подставится автоматически.
      </p>
      <div className="rounded-[30px] bg-white p-6 shadow-lg md:p-8">
        <ProfileForm />
      </div>
    </Container>
  );
};
