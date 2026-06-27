"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { RatingStars, useProductReviews } from "@/entities/review";
import { Button, QueryErrorState, Skeleton } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

type ProductReviewsProps = {
  productId: string;
  variant?: "page" | "modal";
  onBack?: () => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const formatReviewTotal = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} отзыв`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} отзыва`;
  }

  return `${count} отзывов`;
};

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

export const ProductReviews = ({
  productId,
  variant = "page",
  onBack,
}: ProductReviewsProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useProductReviews(
    productId,
    page,
  );
  const isModal = variant === "modal";

  if (isModal) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-[#F4F1EE]">
        <div className="shrink-0 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7EE] text-primary transition-transform duration-200 hover:scale-105"
                    aria-label="Назад к настройке"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                ) : null}
                <h2 className="text-xl font-extrabold">Отзывы</h2>
              </div>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Оценки покупателей после оформленного заказа.
              </p>
            </div>

            <div className="flex min-w-14 flex-col items-center justify-center rounded-2xl bg-[#FFF7EE] px-3 py-2 text-center">
              <p className="text-lg font-extrabold text-primary">
                {data?.meta.total ?? 0}
              </p>
              <p className="text-xs font-semibold text-gray-500">всего</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#F7F5F3] px-3 py-2">
              <p className="text-xs font-semibold text-gray-400">Отзывы</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {formatReviewTotal(data?.meta.total ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F5F3] px-3 py-2">
              <p className="text-xs font-semibold text-gray-400">Страница</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {data?.meta.totalPages
                  ? `${data.meta.page} из ${data.meta.totalPages}`
                  : "1 из 1"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-32 rounded-3xl bg-white/80" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl bg-white/80 shadow-sm">
              <QueryErrorState
                compact
                title="Не удалось загрузить отзывы"
                description="Попробуйте повторить запрос."
                actionLabel={isFetching ? "Загрузка..." : "Повторить"}
                actionDisabled={isFetching}
                onAction={() => void refetch()}
              />
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="space-y-3">
                {data.data.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-white/70 bg-white p-4 shadow-sm shadow-black/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7EE] text-sm font-extrabold text-primary">
                          {getInitial(review.user.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-gray-950">
                            {review.user.name}
                          </h3>
                          <p className="text-xs font-medium text-gray-400">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-[#FFF7EE] px-2 py-1">
                        <RatingStars
                          value={review.rating}
                          iconClassName="size-3.5"
                        />
                      </div>
                    </div>

                    {review.comment ? (
                      <p className="mt-4 rounded-2xl bg-[#F7F5F3] p-3 text-sm leading-6 text-gray-700">
                        {review.comment}
                      </p>
                    ) : (
                      <p className="mt-4 rounded-2xl bg-[#F7F5F3] p-3 text-sm font-medium text-gray-400">
                        Пользователь оставил оценку без комментария.
                      </p>
                    )}
                  </article>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between rounded-3xl bg-white/80 p-2 shadow-sm">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page <= 1 || isFetching}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    Назад
                  </Button>
                  <span className="text-sm font-bold text-gray-500">
                    {data.meta.page} / {data.meta.totalPages}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={page >= data.meta.totalPages || isFetching}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(data.meta.totalPages, current + 1),
                      )
                    }
                  >
                    Вперёд
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-full items-center justify-center rounded-3xl border border-dashed border-primary/25 bg-white/75 p-6 text-center">
              <div>
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-3xl bg-[#FFF7EE] text-primary">
                  <MessageSquare className="size-7" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-950">
                  Отзывов пока нет
                </h3>
                <p className="mt-2 text-sm leading-5 text-gray-500">
                  Первый отзыв появится после успешного заказа.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        isModal
          ? "flex h-full min-h-0 flex-col bg-[#F4F1EE]"
          : "mt-8 rounded-[30px] bg-white p-6 shadow-lg md:p-8",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-transform duration-200 hover:scale-105"
                aria-label="Назад к настройке"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : null}
            <h2
              className={cn(
                "font-extrabold",
                isModal ? "text-xl" : "text-2xl",
              )}
            >
              Отзывы
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Оценки оставляют только пользователи, которые оформили заказ.
          </p>
        </div>
        {data?.meta.total ? (
          <span className="text-sm font-semibold text-gray-500">
            Всего: {data.meta.total}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          isModal
            ? "mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "mt-6",
        )}
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <QueryErrorState
            title="Не удалось загрузить отзывы"
            description="Попробуйте повторить запрос."
            actionLabel={isFetching ? "Загрузка..." : "Повторить"}
            actionDisabled={isFetching}
            onAction={() => void refetch()}
          />
        ) : data && data.data.length > 0 ? (
          <>
            <div className="space-y-3">
              {data.data.map((review) => (
                <article
                  key={review.id}
                  className={cn(
                    "rounded-2xl border border-gray-100 p-4",
                    isModal && "bg-white",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{review.user.name}</h3>
                      <p className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <RatingStars value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>
            {data.meta.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Назад
                </Button>
                <span className="text-sm font-semibold text-gray-500">
                  {data.meta.page} / {data.meta.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= data.meta.totalPages || isFetching}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(data.meta.totalPages, current + 1),
                    )
                  }
                >
                  Вперёд
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-[#FFF7EE] p-6 text-center">
            <MessageSquare className="mx-auto mb-3 size-8 text-primary" />
            <h3 className="font-bold">Отзывов пока нет</h3>
            <p className="mt-1 text-sm text-gray-500">
              Первый отзыв появится после успешного заказа.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
