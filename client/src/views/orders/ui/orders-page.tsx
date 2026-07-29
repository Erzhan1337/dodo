"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  MapPin,
  PackageCheck,
  Star,
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
import {
  getOrderDisplayStatus,
  useRealtimeOrdersStatus,
  type Order,
  type OrderItem,
} from "@/entities/order";
import { useOrders } from "@/entities/order/api/use-orders";
import { useSessionStore } from "@/entities/session/model/store";
import { RatingStars } from "@/entities/review";
import { ReviewModal } from "@/features/reviews";

const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getOrderNumber = (order: Order) =>
  String(order.orderNumber).padStart(6, "0");

const getItemsLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`;
  }

  return `${count} товаров`;
};

const OrderCard = ({
  order,
  onReview,
}: {
  order: Order;
  onReview: (item: OrderItem) => void;
}) => {
  const status = getOrderDisplayStatus(order);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const hiddenItemsCount = order.items.length - previewItems.length;
  const canReview =
    order.status === "COMPLETED" && order.payment?.status === "SUCCEEDED";

  return (
    <article className="rounded-[30px] bg-white p-5 shadow-lg md:p-6">
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
            <span className="min-w-0 text-gray-700">
              <span>
                {item.customName || item.productItem.product.name}
                <span className="text-gray-400"> × {item.quantity}</span>
              </span>
              {item.customDetails?.halfAndHalf && (
                <span className="mt-1 block text-xs font-semibold text-primary">
                  Левая: {item.customDetails.halfAndHalf.leftProduct.name} ·
                  Правая: {item.customDetails.halfAndHalf.rightProduct.name}
                </span>
              )}
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

      {canReview && (
        <div className="mt-5 rounded-2xl border border-orange-100 bg-[#FFFDF9] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Star className="size-4 fill-primary text-primary" />
            Оцените заказанные товары
          </div>
          <div className="space-y-2">
            {order.items.map((item) => {
              const title = item.customName || item.productItem.product.name;
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800">{title}</div>
                    {item.review ? (
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <RatingStars
                          value={item.review.rating}
                          iconClassName="size-3.5"
                        />
                        Оценено
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">
                        Оценки пока нет
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={item.review ? "outline" : "secondary"}
                    size="sm"
                    className="px-3 text-primary"
                    onClick={() => onReview(item)}
                  >
                    {item.review ? "Изменить" : "Оценить"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-end">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
          <Link href={`/order/${order.token}`}>
            Подробнее
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
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
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const _hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const authStatus = useSessionStore((state) => state.status);
  const { data: orders, isLoading, isError, isFetching, refetch } = useOrders();

  useRealtimeOrdersStatus(orders);

  useEffect(() => {
    if (_hasHydrated && authStatus === "anonymous") {
      router.replace("/login");
    }
  }, [_hasHydrated, authStatus, router]);

  if (
    !_hasHydrated ||
    authStatus === "bootstrapping" ||
    authStatus === "unavailable" ||
    isLoading
  ) {
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
            <OrderCard key={order.id} order={order} onReview={setReviewItem} />
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
      <ReviewModal
        item={reviewItem}
        isOpen={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
      />
    </Container>
  );
};
