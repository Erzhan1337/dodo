"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { useCreateProductReview, useDeleteProductReview, useUpdateProductReview } from "@/features/reviews/api/use-review-mutations";
import type { OrderItem } from "@/entities/order";
import { RatingStarsInput } from "@/entities/review";
import { handleApiError } from "@/shared/lib/handle-api-error";
import { Button, Modal } from "@/shared/ui";

type Props = {
  item: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ReviewModal = ({ item, isOpen, onClose }: Props) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createMutation = useCreateProductReview();
  const updateMutation = useUpdateProductReview();
  const deleteMutation = useDeleteProductReview();

  const existingReview = item?.review ?? null;
  const title = item
    ? item.customName || item.productItem.product.name
    : "Оценка товара";
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    if (!item) return;
    setRating(item.review?.rating ?? 5);
    setComment(item.review?.comment ?? "");
  }, [item]);

  const normalizedComment = useMemo(() => comment.trim(), [comment]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!item) return;

    if (existingReview) {
      updateMutation.mutate(
        {
          id: existingReview.id,
          payload: { rating, comment: normalizedComment },
        },
        {
          onSuccess: onClose,
          onError: handleApiError,
        },
      );
      return;
    }

    createMutation.mutate(
      {
        orderItemId: item.id,
        rating,
        comment: normalizedComment,
      },
      {
        onSuccess: onClose,
        onError: handleApiError,
      },
    );
  };

  const handleDelete = () => {
    if (!existingReview) return;

    deleteMutation.mutate(existingReview.id, {
      onSuccess: onClose,
      onError: handleApiError,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[calc(100vw-24px)] max-w-lg rounded-3xl bg-white"
    >
      <form className="p-6" onSubmit={handleSubmit}>
        <div className="pr-8">
          <div className="flex items-center gap-2 text-primary">
            <MessageSquare className="size-5" />
            <span className="text-sm font-bold uppercase">Отзыв</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold">
            {existingReview ? "Изменить оценку" : "Оценить товар"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{title}</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold">Оценка</label>
          <div className="mt-2">
            <RatingStarsInput
              value={rating}
              onChange={setRating}
              disabled={isPending}
            />
          </div>
        </div>

        <label className="mt-5 block text-sm font-semibold">
          Комментарий
          <textarea
            value={comment}
            maxLength={500}
            disabled={isPending}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Что понравилось или что можно улучшить?"
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="mt-1 text-right text-xs text-gray-400">
          {comment.length}/500
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {existingReview ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              className="gap-2 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              Удалить
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending} className="px-5">
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
