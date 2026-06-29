"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { ProductCard } from "@/entities/product";
import { useSessionStore } from "@/entities/session/model/store";
import { useFavoriteProducts } from "@/features/favorites";
import {
  Breadcrumbs,
  Button,
  Container,
  QueryErrorState,
  Skeleton,
  Title,
} from "@/shared/ui";

const FavoritesPageSkeleton = () => (
  <Container className="mt-10 pb-20">
    <Skeleton className="mb-5 h-5 w-44" />
    <Skeleton className="mb-8 h-9 w-52" />
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index}>
          <Skeleton className="h-50 rounded-2xl md:h-70" />
          <Skeleton className="mt-4 h-7 w-40 rounded-md" />
          <Skeleton className="mt-3 h-12 rounded-md" />
          <Skeleton className="mt-5 h-10 rounded-xl" />
        </div>
      ))}
    </div>
  </Container>
);

export const FavoritesPage = () => {
  const router = useRouter();
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const favoritesQuery = useFavoriteProducts();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || favoritesQuery.isLoading) {
    return <FavoritesPageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="mt-10 pb-20">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Избранное" }]}
        className="mb-5"
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Title text="Избранное" className="text-2xl lg:text-3xl" />
          <p className="mt-2 text-gray-500">
            Быстрый доступ к пиццам, которые хочется заказать снова.
          </p>
        </div>
        <Button asChild size="lg" className="px-5">
          <Link href="/">В меню</Link>
        </Button>
      </div>

      {favoritesQuery.isError ? (
        <div className="rounded-[30px] bg-white shadow-lg">
          <QueryErrorState
            title="Не удалось загрузить избранное"
            description="Проверьте соединение и попробуйте ещё раз."
            actionLabel={favoritesQuery.isFetching ? "Загрузка..." : "Повторить"}
            actionDisabled={favoritesQuery.isFetching}
            onAction={() => void favoritesQuery.refetch()}
          />
        </div>
      ) : favoritesQuery.data && favoritesQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {favoritesQuery.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] bg-white p-8 text-center shadow-lg md:p-10">
          <Heart className="mx-auto mb-4 size-12 text-primary" />
          <Title text="В избранном пока пусто" className="text-2xl" />
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            Нажмите на сердечко в карточке товара, чтобы сохранить пиццу здесь.
          </p>
          <Button asChild size="lg" className="mt-6 px-6">
            <Link href="/">Выбрать пиццу</Link>
          </Button>
        </div>
      )}
    </Container>
  );
};
