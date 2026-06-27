"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const formatReviewCount = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} оценка`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} оценки`;
  }

  return `${count} оценок`;
};

export const RatingStars = ({
  value,
  className,
  iconClassName,
}: {
  value: number;
  className?: string;
  iconClassName?: string;
}) => {
  const rounded = Math.round(value);

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const isActive = index + 1 <= rounded;
        return (
          <Star
            key={index}
            className={cn(
              "size-4",
              isActive ? "fill-primary text-primary" : "text-gray-300",
              iconClassName,
            )}
          />
        );
      })}
    </span>
  );
};

export const RatingStarsInput = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const previewValue = hoveredRating ?? value;

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      onMouseLeave={() => setHoveredRating(null)}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const isActive = rating <= previewValue;

        return (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            aria-label={`${rating} из 5`}
            aria-checked={value === rating}
            role="radio"
            onMouseEnter={() => setHoveredRating(rating)}
            onFocus={() => setHoveredRating(rating)}
            onBlur={() => setHoveredRating(null)}
            onClick={() => onChange(rating)}
            className="group rounded-md p-1 text-primary outline-none transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
          >
            <Star
              className={cn(
                "size-7 transition-all duration-150 ease-out",
                isActive
                  ? "scale-105 fill-primary text-primary drop-shadow-[0_2px_8px_rgba(249,115,22,0.25)]"
                  : "scale-95 fill-transparent text-gray-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export const ProductRatingSummary = ({
  ratingAvg,
  ratingCount,
  className,
  compact = false,
}: {
  ratingAvg: number;
  ratingCount: number;
  className?: string;
  compact?: boolean;
}) => {
  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm text-gray-600", className)}>
        <Star
          className={cn(
            "size-4 text-primary",
            ratingCount > 0 ? "fill-primary" : "fill-none opacity-60",
          )}
        />
        <span className="font-bold text-gray-900">
          {ratingCount > 0 ? ratingAvg.toFixed(1) : "Новинка"}
        </span>
      </span>
    );
  }

  if (ratingCount === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-gray-400", className)}>
        <RatingStars value={0} iconClassName="size-3.5" />
        Нет оценок
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-gray-600", className)}>
      <RatingStars value={ratingAvg} iconClassName="size-3.5" />
      <span className="font-bold text-gray-900">{ratingAvg.toFixed(1)}</span>
      <span>{formatReviewCount(ratingCount)}</span>
    </span>
  );
};
