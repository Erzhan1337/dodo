"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LazyMotion, m } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Pizza,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { useAddToCart } from "@/features/cart/api/use-cart";
import {
  BuilderIngredientLine,
  usePizzaBuilder,
} from "@/features/pizza-builder/model/use-pizza-builder";
import {
  getIngredientCategory,
  INGREDIENT_CATEGORY_LABELS,
  IngredientCategory,
  PIZZA_BAKE_OPTIONS,
  PIZZA_BUILDER_MAX_DOUBLE_INGREDIENTS,
  PIZZA_BUILDER_MAX_INGREDIENTS,
  PIZZA_BUILDER_STEPS,
  PIZZA_CHEESE_OPTIONS,
  PIZZA_SAUCE_OPTIONS,
  PIZZA_SIZE_LABELS,
  PIZZA_SLICE_OPTIONS,
  PIZZA_TYPE_LABELS,
} from "@/features/pizza-builder/model/constants";
import type { Ingredient } from "@/entities/ingredient/model/types";
import type {
  CustomPizzaCheeseMode,
  CustomPizzaFormat,
  CustomPizzaPlacement,
} from "@/entities/cart/model/types";
import { BLUR_DATA_URL } from "@/shared/lib/blur-data-url";
import { formatPrice } from "@/shared/lib/format-price";
import { loadMotionFeatures } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { Breadcrumbs, Button, Container, QueryErrorState, Skeleton } from "@/shared/ui";

const overlayPositions = [
  { left: 41, top: 26 },
  { left: 56, top: 35 },
  { left: 33, top: 48 },
  { left: 62, top: 55 },
  { left: 46, top: 64 },
  { left: 27, top: 34 },
  { left: 70, top: 43 },
  { left: 38, top: 74 },
  { left: 52, top: 18 },
  { left: 22, top: 58 },
  { left: 76, top: 64 },
  { left: 49, top: 47 },
];

const CHEESE_MODE_TEXT: Record<CustomPizzaCheeseMode, string> = {
  standard: "стандартный сыр",
  double: "двойной сыр",
  none: "без сыра",
};

const PLACEMENT_TEXT: Record<CustomPizzaPlacement, string> = {
  whole: "вся пицца",
  left: "левая половина",
  right: "правая половина",
};

type SegmentOption<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

const SEGMENT_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

const QUANTITY_OPTIONS: SegmentOption<0 | 1 | 2>[] = [
  { value: 0, label: "Без" },
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
];

const SegmentGroup = <T extends string | number>({
  options,
  value,
  onChange,
  className,
  buttonClassName,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
}) => {
  const layoutId = useId();

  return (
    <LazyMotion features={loadMotionFeatures}>
      <div
        className={cn(
          "grid gap-1 rounded-2xl bg-[#ECECEC] p-1 shadow-sm",
          options.length === 2 && "grid-cols-2",
          options.length === 3 && "grid-cols-3",
          className,
        )}
      >
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={String(option.value)}
              type="button"
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative z-10 min-h-11 cursor-pointer rounded-xl px-3 text-sm font-semibold transition-colors",
                isActive ? "text-black" : "text-gray-500 hover:text-black",
                option.disabled &&
                  "cursor-not-allowed opacity-45 hover:text-gray-500",
                buttonClassName,
              )}
            >
              {isActive && (
                <m.div
                  layoutId={layoutId}
                  transition={SEGMENT_TRANSITION}
                  style={{ zIndex: -1 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-md"
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </LazyMotion>
  );
};

const StepTabs = ({
  activeStepIndex,
  onChange,
}: {
  activeStepIndex: number;
  onChange: (index: number) => void;
}) => {
  const layoutId = useId();

  return (
    <LazyMotion features={loadMotionFeatures}>
      <div className="w-full overflow-x-auto rounded-2xl bg-[#ECECEC] p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-1 sm:min-w-full">
          {PIZZA_BUILDER_STEPS.map((step, index) => {
            const isActive = activeStepIndex === index;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onChange(index)}
                className={cn(
                  "relative z-10 min-h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold transition-colors sm:flex-1",
                  isActive ? "text-primary" : "text-gray-500 hover:text-primary",
                )}
              >
                {isActive && (
                  <m.div
                    layoutId={layoutId}
                    transition={SEGMENT_TRANSITION}
                    style={{ zIndex: -1 }}
                    className="absolute inset-0 rounded-xl bg-white shadow-md"
                  />
                )}
                <span className="relative z-10">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
};

const IngredientCategoryTabs = ({
  activeCategory,
  onChange,
}: {
  activeCategory: IngredientCategory;
  onChange: (category: IngredientCategory) => void;
}) => {
  const layoutId = useId();

  return (
    <LazyMotion features={loadMotionFeatures}>
      <div className="mb-4 w-full overflow-x-auto rounded-2xl bg-[#ECECEC] p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-1">
          {INGREDIENT_CATEGORY_LABELS.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onChange(category)}
                className={cn(
                  "relative z-10 min-h-10 shrink-0 cursor-pointer rounded-xl px-4 text-sm font-semibold transition-colors",
                  isActive ? "text-primary" : "text-gray-500 hover:text-primary",
                )}
              >
                {isActive && (
                  <m.div
                    layoutId={layoutId}
                    transition={SEGMENT_TRANSITION}
                    style={{ zIndex: -1 }}
                    className="absolute inset-0 rounded-xl bg-white shadow-md"
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LazyMotion>
  );
};

const PizzaPreview = ({
  imageUrl,
  leftHalfImageUrl,
  rightHalfImageUrl,
  name,
  format,
  lines,
  removedCount,
  totalPrice,
  weight,
  calories,
}: {
  imageUrl?: string;
  leftHalfImageUrl?: string;
  rightHalfImageUrl?: string;
  name: string;
  format: CustomPizzaFormat;
  lines: BuilderIngredientLine[];
  removedCount: number;
  totalPrice: number;
  weight: number;
  calories: number;
}) => {
  const overlayItems = lines.flatMap((line, lineIndex) => {
    const count = line.quantity === 2 ? 3 : 2;
    return Array.from({ length: count }).map((_, index) => ({
      line,
      key: `${line.id}-${line.source}-${index}`,
      position:
        overlayPositions[(lineIndex * 3 + index) % overlayPositions.length],
    }));
  });

  return (
    <div className="sticky top-24 rounded-[28px] bg-white p-5 shadow-lg lg:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-primary">
            <Pizza className="size-4" />
            Конструктор
          </div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight lg:text-3xl">
            {name}
          </h1>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Итого</div>
          <div className="text-2xl font-extrabold text-primary">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </div>

      <div className="relative mx-auto aspect-square max-w-95 overflow-hidden rounded-full bg-[#FFF7EE]">
        {format === "halves" && (
          <div className="absolute left-1/2 top-[8%] z-20 h-[84%] w-px -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]" />
        )}
        {format === "halves" && leftHalfImageUrl && rightHalfImageUrl ? (
          <>
            <Image
              src={leftHalfImageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 320px, 380px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-contain p-6"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
            <Image
              src={rightHalfImageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 320px, 380px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-contain p-6"
              style={{ clipPath: "inset(0 0 0 50%)" }}
            />
          </>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 320px, 380px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-contain p-6"
          />
        ) : null}
        {overlayItems.map(({ line, key, position }) => {
          const left =
            line.placement === "left"
              ? Math.min(position.left, 43)
              : line.placement === "right"
                ? Math.max(position.left, 57)
                : position.left;

          return (
            <div
              key={key}
              className="absolute z-10 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 p-0.5 drop-shadow-sm"
              style={{ left: `${left}%`, top: `${position.top}%` }}
            >
              <Image
                src={line.imageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-[#F4F1EE] px-2 py-3">
          <div className="text-xs text-gray-500">Вес</div>
          <div className="font-bold">~{weight} г</div>
        </div>
        <div className="rounded-2xl bg-[#F4F1EE] px-2 py-3">
          <div className="text-xs text-gray-500">Ккал</div>
          <div className="font-bold">~{calories}</div>
        </div>
        <div className="rounded-2xl bg-[#F4F1EE] px-2 py-3">
          <div className="text-xs text-gray-500">Убрано</div>
          <div className="font-bold">{removedCount}</div>
        </div>
      </div>
    </div>
  );
};

const QuantitySelector = ({
  value,
  onChange,
}: {
  value: 0 | 1 | 2;
  onChange: (value: 0 | 1 | 2) => void;
}) => (
  <SegmentGroup
    value={value}
    onChange={onChange}
    options={QUANTITY_OPTIONS}
    className="rounded-xl"
    buttonClassName="min-h-8 rounded-lg text-xs"
  />
);

const IngredientTile = ({
  ingredient,
  quantity,
  placement,
  format,
  linePrice,
  onQuantityChange,
  onPlacementChange,
}: {
  ingredient: Ingredient;
  quantity: 0 | 1 | 2;
  placement: CustomPizzaPlacement;
  format: CustomPizzaFormat;
  linePrice: number;
  onQuantityChange: (value: 0 | 1 | 2) => void;
  onPlacementChange: (value: CustomPizzaPlacement) => void;
}) => (
  <div
    className={cn(
      "rounded-2xl bg-white p-3 shadow-sm ring-1 ring-transparent transition-all",
      quantity > 0 && "ring-primary",
    )}
  >
    <div className="flex items-start gap-3">
      <div className="relative size-16 shrink-0">
        <Image
          src={ingredient.imageUrl}
          alt={ingredient.name}
          fill
          sizes="64px"
          className="object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2 min-h-10 text-sm font-bold">
          {ingredient.name}
        </div>
        <div className="mt-1 text-sm font-semibold text-primary">
          {quantity > 0 ? `+${formatPrice(linePrice)}` : `+${formatPrice(ingredient.price)}`}
        </div>
      </div>
      {quantity > 0 && <Check className="size-5 shrink-0 text-primary" />}
    </div>

    <div className="mt-3">
      <QuantitySelector value={quantity} onChange={onQuantityChange} />
    </div>

    {format === "halves" && quantity > 0 && (
      <SegmentGroup
        className="mt-2"
        value={placement}
        onChange={onPlacementChange}
        options={[
          { value: "whole", label: "Вся" },
          { value: "left", label: "Левая" },
          { value: "right", label: "Правая" },
        ]}
      />
    )}
  </div>
);

const PizzaBuilderSkeleton = () => (
  <Container className="mt-8 pb-20">
    <Skeleton className="mb-5 h-5 w-52" />
    <div className="grid gap-8 lg:grid-cols-[minmax(320px,440px)_1fr]">
      <Skeleton className="h-[560px] rounded-[28px]" />
      <Skeleton className="h-[620px] rounded-[28px]" />
    </div>
  </Container>
);

export const PizzaBuilderPage = () => {
  const router = useRouter();
  const builder = usePizzaBuilder();
  const addToCart = useAddToCart();
  const [activeCategory, setActiveCategory] =
    useState<IngredientCategory>("Популярное");
  const baseProductLayoutId = useId();
  const rightProductLayoutId = useId();
  const sauceLayoutId = useId();

  const visibleIngredients = useMemo(() => {
    return builder.ingredients.filter((ingredient) => {
      if (ingredient.name.toLowerCase().includes("моцарелла")) return false;
      if (activeCategory === "Популярное") return true;
      return getIngredientCategory(ingredient) === activeCategory;
    });
  }, [activeCategory, builder.ingredients]);

  if (builder.isLoading) {
    return <PizzaBuilderSkeleton />;
  }

  if (builder.isError) {
    return (
      <Container className="mt-10">
        <QueryErrorState
          title="Не удалось открыть конструктор"
          description="Проверьте подключение к серверу и попробуйте ещё раз."
          actionLabel={builder.isFetching ? "Загрузка..." : "Повторить"}
          actionDisabled={builder.isFetching}
          onAction={() => void builder.refetch()}
        />
      </Container>
    );
  }

  const activeStep = PIZZA_BUILDER_STEPS[builder.activeStepIndex];
  const productImage =
    builder.currentItem?.imageUrl || builder.baseProduct?.imageUrl;
  const rightProductImage =
    builder.rightCurrentItem?.imageUrl || builder.rightProduct?.imageUrl;
  const selectedProductName = builder.customName.trim() || "Моя пицца";

  const handleIngredientQuantity = (
    ingredient: Ingredient,
    quantity: 0 | 1 | 2,
  ) => {
    const updated = builder.setIngredientQuantity(ingredient.id, quantity);

    if (!updated && quantity > 0) {
      toast.error(
        quantity === 2
          ? `Можно выбрать до ${PIZZA_BUILDER_MAX_DOUBLE_INGREDIENTS} двойных порций`
          : `Можно выбрать до ${PIZZA_BUILDER_MAX_INGREDIENTS} ингредиентов`,
      );
    }
  };

  const handleSubmit = () => {
    if (!builder.cartPayload) {
      toast.error("Выберите доступный размер и тесто");
      return;
    }

    addToCart.mutate(builder.cartPayload, {
      onSuccess: () => {
        toast.success("Кастомная пицца добавлена в корзину");
        router.push("/cart");
      },
    });
  };

  return (
    <main className="bg-[#F7F4F0] pb-24 pt-6 lg:pb-16">
      <Container>
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Конструктор" }]}
          className="mb-5"
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(320px,440px)_1fr]">
          <PizzaPreview
            imageUrl={productImage}
            leftHalfImageUrl={productImage}
            rightHalfImageUrl={rightProductImage}
            name={selectedProductName}
            format={builder.format}
            lines={builder.builderIngredientLines}
            removedCount={builder.removedIngredientIds.length}
            totalPrice={builder.totalPrice}
            weight={builder.estimatedWeight}
            calories={builder.estimatedCalories}
          />

          <section className="min-w-0 rounded-[28px] bg-[#F4F1EE] p-4 shadow-lg md:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-extrabold lg:text-3xl">
                  Соберите свою пиццу
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Выберите основу, добавки и настройки. Цена пересчитывается сразу.
                </p>
              </div>
              <StepTabs
                activeStepIndex={builder.activeStepIndex}
                onChange={builder.setActiveStepIndex}
              />
            </div>

            <div className="min-h-[460px]">
              {activeStep.id === "base" && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 text-lg font-bold">Формат</div>
                    <SegmentGroup<CustomPizzaFormat>
                      value={builder.format}
                      onChange={builder.setFormat}
                      options={[
                        { value: "whole", label: "Целая" },
                        {
                          value: "halves",
                          label: "Две половинки",
                          disabled: !builder.canUseHalves,
                        },
                      ]}
                    />
                    {!builder.canUseHalves && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-amber-700">
                        <AlertTriangle className="size-4" />
                        {builder.baseProduct?.canBuildHalfAndHalf
                          ? "Половинки доступны для 30 и 35 см."
                          : "Для этой пиццы половинки недоступны."}
                      </div>
                    )}
                  </div>

                  {builder.format === "halves" ? (
                    <div>
                      <div className="mb-3 text-lg font-bold">
                        Собрать из двух пицц
                      </div>
                      <LazyMotion features={loadMotionFeatures}>
                        <div className="grid gap-4 lg:grid-cols-2">
                          {[
                            {
                              title: "Левая половина",
                              activeId: builder.baseProductId,
                              layoutId: baseProductLayoutId,
                              onSelect: builder.setBaseProductId,
                            },
                            {
                              title: "Правая половина",
                              activeId: builder.rightProductId,
                              layoutId: rightProductLayoutId,
                              onSelect: builder.setRightHalfProductId,
                            },
                          ].map((column) => (
                            <div key={column.title}>
                              <div className="mb-2 text-sm font-bold text-gray-500">
                                {column.title}
                              </div>
                              <div className="grid gap-2">
                                {builder.halfAndHalfProducts.map((product) => {
                                  const active = product.id === column.activeId;
                                  const disabled =
                                    column.title === "Правая половина" &&
                                    product.id === builder.baseProductId;
                                  const firstItem = product.items[0];

                                  return (
                                    <button
                                      key={`${column.title}-${product.id}`}
                                      type="button"
                                      disabled={disabled}
                                      onClick={() => column.onSelect(product.id)}
                                      className="relative z-10 flex min-h-20 items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45"
                                    >
                                      {active && (
                                        <m.div
                                          layoutId={column.layoutId}
                                          transition={SEGMENT_TRANSITION}
                                          className="absolute inset-0 rounded-2xl bg-orange-50 shadow-md ring-1 ring-primary"
                                        />
                                      )}
                                      <div className="relative z-10 size-14 shrink-0">
                                        <Image
                                          src={product.imageUrl}
                                          alt={product.name}
                                          fill
                                          sizes="56px"
                                          className="object-contain"
                                        />
                                      </div>
                                      <div className="relative z-10 min-w-0">
                                        <div className="font-bold">
                                          {product.name}
                                        </div>
                                        {firstItem && (
                                          <div className="mt-1 text-sm font-semibold text-primary">
                                            половина от{" "}
                                            {formatPrice(firstItem.price)}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </LazyMotion>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3 text-lg font-bold">
                        Начать с готовой пиццы
                      </div>
                      <LazyMotion features={loadMotionFeatures}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {builder.products.map((product) => {
                            const active = product.id === builder.baseProductId;
                            const firstItem = product.items[0];

                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() =>
                                  builder.setBaseProductId(product.id)
                                }
                                className="relative z-10 flex min-h-24 items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm transition-colors"
                              >
                                {active && (
                                  <m.div
                                    layoutId={baseProductLayoutId}
                                    transition={SEGMENT_TRANSITION}
                                    className="absolute inset-0 rounded-2xl bg-orange-50 shadow-md ring-1 ring-primary"
                                  />
                                )}
                                <div className="relative z-10 size-16 shrink-0">
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    sizes="64px"
                                    className="object-contain"
                                  />
                                </div>
                                <div className="relative z-10 min-w-0">
                                  <div className="font-bold">{product.name}</div>
                                  <div className="line-clamp-2 text-xs text-gray-500">
                                    {product.description}
                                  </div>
                                  {firstItem && (
                                    <div className="mt-1 text-sm font-semibold text-primary">
                                      от {formatPrice(firstItem.price)}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </LazyMotion>
                    </div>
                  )}
                </div>
              )}

              {activeStep.id === "size" && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 text-lg font-bold">Размер</div>
                    <SegmentGroup<number>
                      value={builder.size ?? 0}
                      onChange={builder.setSize}
                      options={[25, 30, 35].map((value) => ({
                        value,
                        label: `${PIZZA_SIZE_LABELS[value]} · ${value} см`,
                        disabled: !builder.availableSizes.includes(value),
                      }))}
                      className="grid-cols-1 sm:grid-cols-3"
                    />
                  </div>

                  <div>
                    <div className="mb-3 text-lg font-bold">Тесто</div>
                    <SegmentGroup<number>
                      value={builder.pizzaType ?? 0}
                      onChange={builder.setPizzaType}
                      options={[1, 2].map((value) => ({
                        value,
                        label: PIZZA_TYPE_LABELS[value],
                        disabled: !builder.availablePizzaTypes.includes(value),
                      }))}
                    />
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-sm text-gray-600">
                    Сейчас: {builder.size} см,{" "}
                    {PIZZA_TYPE_LABELS[builder.pizzaType ?? 1]?.toLowerCase()}{" "}
                    тесто. Базовая цена{" "}
                    <span className="font-bold text-black">
                      {formatPrice(builder.baseUnitPrice)}
                    </span>
                    .
                  </div>
                </div>
              )}

              {activeStep.id === "sauce" && (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 text-lg font-bold">Основа и соус</div>
                    <LazyMotion features={loadMotionFeatures}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {PIZZA_SAUCE_OPTIONS.map((option) => {
                          const active = builder.sauce === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => builder.setSauce(option.id)}
                              className="relative z-10 rounded-2xl bg-white p-4 text-left shadow-sm transition-colors"
                            >
                              {active && (
                                <m.div
                                  layoutId={sauceLayoutId}
                                  transition={SEGMENT_TRANSITION}
                                  className="absolute inset-0 rounded-2xl bg-orange-50 shadow-md ring-1 ring-primary"
                                />
                              )}
                              <div className="relative z-10 flex items-center justify-between gap-3">
                                <div className="font-bold">{option.name}</div>
                                {active && (
                                  <Check className="size-5 text-primary" />
                                )}
                              </div>
                              <div className="relative z-10 mt-1 text-sm text-gray-500">
                                {option.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </LazyMotion>
                  </div>

                  <div>
                    <div className="mb-3 text-lg font-bold">Сыр</div>
                    <SegmentGroup<CustomPizzaCheeseMode>
                      value={builder.cheeseMode}
                      onChange={builder.setCheeseMode}
                      options={PIZZA_CHEESE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                    />
                    {builder.cheeseMode === "none" && (
                      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <AlertTriangle className="size-4 shrink-0" />
                        Пицца без сыра будет менее сочной. Цена базы не уменьшается.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeStep.id === "toppings" && (
                <div className="space-y-6">
                  {builder.baseIngredients.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-lg font-bold">Убрать из основы</div>
                        <div className="text-sm text-gray-500">
                          Без скидки к цене
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {builder.baseIngredients.map((ingredient) => {
                          const removed = builder.removedIngredientIds.includes(
                            ingredient.id,
                          );

                          return (
                            <button
                              key={ingredient.id}
                              type="button"
                              onClick={() =>
                                builder.toggleBaseIngredient(ingredient.id)
                              }
                              className={cn(
                                "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors",
                                removed
                                  ? "bg-gray-900 text-white"
                                  : "bg-white text-gray-600 hover:text-black",
                              )}
                            >
                              {removed ? "Без " : ""}
                              {ingredient.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-lg font-bold">Добавить по вкусу</div>
                        <div className="text-sm text-gray-500">
                          {builder.selectedCount}/{PIZZA_BUILDER_MAX_INGREDIENTS}{" "}
                          ингредиентов, {builder.doubleCount}/
                          {PIZZA_BUILDER_MAX_DOUBLE_INGREDIENTS} двойных порций
                        </div>
                      </div>
                    </div>

                    <IngredientCategoryTabs
                      activeCategory={activeCategory}
                      onChange={setActiveCategory}
                    />

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {visibleIngredients.map((ingredient) => {
                        const selected = builder.selectedIngredients[
                          ingredient.id
                        ];
                        const quantity = selected?.quantity ?? 0;
                        const placement = selected?.placement ?? "whole";
                        const linePrice =
                          quantity > 0
                            ? Math.round(
                                ingredient.price *
                                  quantity *
                                  (placement === "whole" ? 1 : 0.5),
                              )
                            : ingredient.price;

                        return (
                          <IngredientTile
                            key={ingredient.id}
                            ingredient={ingredient}
                            quantity={quantity}
                            placement={placement}
                            format={builder.format}
                            linePrice={linePrice}
                            onQuantityChange={(nextQuantity) =>
                              handleIngredientQuantity(ingredient, nextQuantity)
                            }
                            onPlacementChange={(nextPlacement) =>
                              builder.setIngredientPlacement(
                                ingredient.id,
                                nextPlacement,
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeStep.id === "review" && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-lg font-bold">
                      Название пиццы
                    </label>
                    <input
                      value={builder.customName}
                      maxLength={40}
                      onChange={(event) =>
                        builder.setCustomName(event.target.value)
                      }
                      className="h-13 w-full rounded-2xl border border-transparent bg-white px-4 text-base font-semibold outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 text-sm font-bold text-gray-500">
                        Запекание
                      </div>
                      <SegmentGroup
                        value={builder.bakeMode}
                        onChange={builder.setBakeMode}
                        options={PIZZA_BAKE_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                      />
                    </div>
                    <div>
                      <div className="mb-2 text-sm font-bold text-gray-500">
                        Нарезка
                      </div>
                      <SegmentGroup
                        value={builder.sliceMode}
                        onChange={builder.setSliceMode}
                        options={PIZZA_SLICE_OPTIONS.map((option) => ({
                          value: option.value,
                          label: option.label,
                        }))}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xl font-extrabold">
                          {selectedProductName}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {builder.size} см,{" "}
                          {PIZZA_TYPE_LABELS[
                            builder.pizzaType ?? 1
                          ]?.toLowerCase()}{" "}
                          тесто · {builder.sauce} ·{" "}
                          {CHEESE_MODE_TEXT[builder.cheeseMode]}
                        </div>
                        {builder.format === "halves" &&
                          builder.baseProduct &&
                          builder.rightProduct && (
                            <div className="mt-2 text-sm font-semibold text-primary">
                              Левая: {builder.baseProduct.name} · Правая:{" "}
                              {builder.rightProduct.name}
                            </div>
                          )}
                      </div>
                      <div className="text-right text-xl font-extrabold text-primary">
                        {formatPrice(builder.totalPrice)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      {builder.builderIngredientLines.map((ingredient) => (
                        <span
                          key={`${ingredient.id}-${ingredient.source}-${ingredient.placement}`}
                          className="rounded-full bg-orange-50 px-3 py-2 text-gray-700"
                        >
                          + {ingredient.name}
                          {ingredient.quantity === 2 && " x2"}
                          {builder.format === "halves" &&
                            ` · ${PLACEMENT_TEXT[ingredient.placement]}`}
                        </span>
                      ))}
                      {builder.removedIngredientIds.map((id) => {
                        const ingredient = builder.baseIngredients.find(
                          (item) => item.id === id,
                        );

                        return (
                          <span
                            key={id}
                            className="rounded-full bg-gray-100 px-3 py-2 text-gray-600"
                          >
                            без {ingredient?.name ?? "ингредиента"}
                          </span>
                        );
                      })}
                    </div>

                    {builder.builderIngredientLines.length === 0 &&
                      builder.removedIngredientIds.length === 0 && (
                        <div className="text-sm text-gray-500">
                          Без изменений к выбранной основе.
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={builder.activeStepIndex === 0}
                onClick={builder.prevStep}
                className="gap-2 bg-white px-5 font-bold text-gray-700"
              >
                <ChevronLeft className="size-4" />
                Назад
              </Button>

              {activeStep.id === "review" ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={!builder.canSubmit || addToCart.isPending}
                  onClick={handleSubmit}
                  className="gap-2 px-5 font-bold"
                >
                  {addToCart.isPending ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="size-4" />
                  )}
                  Добавить в корзину
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  onClick={builder.nextStep}
                  className="gap-2 px-5 font-bold"
                >
                  Далее
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
};
