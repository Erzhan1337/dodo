"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { RatingStars, useProductReviews } from "@/entities/review";
import { Button, QueryErrorState, Skeleton } from "@/shared/ui";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const ProductReviews = ({ productId }: { productId: string }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useProductReviews(
    productId,
    page,
  );

  return (
    <section className="mt-8 rounded-[30px] bg-white p-6 shadow-lg md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Отзывы</h2>
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

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState
          className="mt-6"
          title="Не удалось загрузить отзывы"
          description="Попробуйте повторить запрос."
          actionLabel={isFetching ? "Загрузка..." : "Повторить"}
          actionDisabled={isFetching}
          onAction={() => void refetch()}
        />
      ) : data && data.data.length > 0 ? (
        <>
          <div className="mt-6 space-y-3">
            {data.data.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-gray-100 p-4"
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
        <div className="mt-6 rounded-2xl bg-[#FFF7EE] p-6 text-center">
          <MessageSquare className="mx-auto mb-3 size-8 text-primary" />
          <h3 className="font-bold">Отзывов пока нет</h3>
          <p className="mt-1 text-sm text-gray-500">
            Первый отзыв появится после успешного заказа.
          </p>
        </div>
      )}
    </section>
  );
};
