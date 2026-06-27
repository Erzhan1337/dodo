"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  MapPin,
  PackageCheck,
} from "lucide-react";
import {
  Breadcrumbs,
  Button,
  Container,
  QueryErrorState,
  Skeleton,
  Title,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { formatPrice } from "@/shared/lib/format-price";
import { ORDER_STATUS_META, type Order } from "@/entities/order";
import { useOrders } from "@/entities/order/api/use-orders";
import { useSessionStore } from "@/entities/session/model/store";

const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getOrderNumber = (order: Order) => order.id.slice(-6).toUpperCase();

const getItemsLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`;
  }

  return `${count} товаров`;
};

const OrderCard = ({ order }: { order: Order }) => {
  const status = ORDER_STATUS_META[order.status];
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const hiddenItemsCount = order.items.length - previewItems.length;

  return (
    <Link
      href={`/order/${order.token}`}
      className="block rounded-[30px] bg-white p-5 shadow-lg transition-transform hover:-translate-y-0.5 md:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold">
              Заказ №{getOrderNumber(order)}
            </h2>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                status.className,
              )}
            >
              {status.text}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {formatOrderDate(order.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PackageCheck className="size-4" />
              {getItemsLabel(totalItems)}
            </span>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-sm text-gray-500">Сумма</div>
          <div className="text-2xl font-extrabold">
            {formatPrice(order.totalPrice)}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#FFF7EE] p-4 text-sm text-gray-600">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
        <span className="break-words">{order.address}</span>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <span className="text-gray-700">
              {item.productItem.product.name}
              <span className="text-gray-400"> × {item.quantity}</span>
            </span>
            <span className="whitespace-nowrap font-semibold">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
        {hiddenItemsCount > 0 && (
          <div className="text-sm text-gray-400">
            Ещё позиций: {hiddenItemsCount}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end text-sm font-semibold text-primary">
        Подробнее
        <ChevronRight className="size-4" />
      </div>
    </Link>
  );
};

const OrdersPageSkeleton = () => {
  return (
    <Container className="mt-10 max-w-4xl pb-20">
      <Skeleton className="mb-5 h-5 w-44" />
      <Skeleton className="mb-8 h-9 w-40" />
      <div className="flex flex-col gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-[30px]" />
        ))}
      </div>
    </Container>
  );
};

export const OrdersPage = () => {
  const router = useRouter();
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const { data: orders, isLoading, isError, isFetching, refetch } = useOrders();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || isLoading) {
    return <OrdersPageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container className="mt-10 max-w-4xl pb-20">
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Заказы" }]}
        className="mb-5"
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Title text="Заказы" className="text-2xl lg:text-3xl" />
          <p className="mt-2 text-gray-500">
            История заказов, оформленных из текущего аккаунта.
          </p>
        </div>
        <Button asChild size="lg" className="px-5">
          <Link href="/">В меню</Link>
        </Button>
      </div>

      {isError ? (
        <div className="rounded-[30px] bg-white shadow-lg">
          <QueryErrorState
            title="Не удалось загрузить заказы"
            description="Проверьте соединение и попробуйте ещё раз."
            actionLabel="Повторить"
            actionDisabled={isFetching}
            onAction={() => void refetch()}
          />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="flex flex-col gap-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] bg-white p-8 text-center shadow-lg md:p-10">
          <ClipboardList className="mx-auto mb-4 size-12 text-primary" />
          <Title text="Заказов пока нет" className="text-2xl" />
          <p className="mx-auto mt-2 max-w-md text-gray-500">
            После оформления заказа он появится здесь вместе со статусом,
            составом и адресом доставки.
          </p>
          <Button asChild size="lg" className="mt-6 px-6">
            <Link href="/">Выбрать пиццу</Link>
          </Button>
        </div>
      )}
    </Container>
  );
};
