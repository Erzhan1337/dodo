# План: отзывы внутри модалки товара

## Цель

Добавить в модалку товара переключение между двумя вкладками:

```txt
Настроить | Отзывы
```

Без вложенной модалки, без отдельной страницы и без увеличения модалки вниз. Вкладка `Настроить` показывает текущий `ProductForm`, вкладка `Отзывы` показывает отзывы этого товара.

## Текущие файлы

- `client/src/widgets/product-modal/ui/product-modal.tsx` - модалка товара.
- `client/src/features/product-configurator/ui/product-form.tsx` - форма настройки товара.
- `client/src/features/reviews/ui/product-reviews.tsx` - блок отзывов.
- `client/src/features/reviews/index.ts` - экспорт отзывов.
- `client/src/entities/review/ui/rating-stars.tsx` - отображение рейтинга.

## Рекомендуемая архитектура

1. Не добавлять отдельную страницу.
2. Не открывать модалку внутри модалки.
3. Сделать tabs прямо внутри `ProductModal`.
4. Состояние вкладки хранить только в `ProductModal`.
5. `ProductForm` не должен знать про вкладки. Максимум можно добавить optional callback `onReviewsClick`.
6. `ProductReviews` должен уметь работать в двух режимах:
   - `page` или default: текущий большой блок с `shadow`, `mt-8`, заголовком.
   - `modal`: компактный режим без внешней карточки, без лишнего `mt`, с ограниченной высотой и внутренним scroll.

## Шаги реализации

### 1. Добавить режимы в `ProductReviews`

В `client/src/features/reviews/ui/product-reviews.tsx` добавить props:

```ts
type ProductReviewsProps = {
  productId: string;
  variant?: "page" | "modal";
  onBack?: () => void;
};
```

Внутри компонента вычислить:

```ts
const isModal = variant === "modal";
```

Для `page` оставить текущий внешний layout:

```tsx
<section className="mt-8 rounded-[30px] bg-white p-6 shadow-lg md:p-8">
```

Для `modal` использовать компактный layout:

```tsx
<section className="flex h-full min-h-0 flex-col bg-[#F4F1EE] p-4 sm:p-6 lg:p-8">
```

### 2. Сделать отзывы scrollable в modal-режиме

В `modal`-режиме список отзывов должен скроллиться внутри вкладки:

```tsx
<div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
  ...
</div>
```

Это важно: scroll должен быть внутри содержимого вкладки, а не на всей модалке.

### 3. Добавить tabs в `ProductModal`

В `client/src/widgets/product-modal/ui/product-modal.tsx` добавить state:

```tsx
const [activeTab, setActiveTab] = useState<"config" | "reviews">("config");
```

Импорты:

```tsx
import { ProductReviews } from "@/features/reviews";
import { ProductRatingSummary } from "@/entities/review";
import { cn } from "@/shared/lib/utils";
```

### 4. Структура `ProductModal`

Рекомендуемая структура:

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  className="max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-250 overflow-hidden rounded-3xl sm:max-h-[calc(100dvh-48px)] sm:w-[calc(100vw-48px)]"
>
  <div className="flex max-h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-3xl bg-white sm:max-h-[calc(100dvh-48px)]">
    <div className="border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
        <div>
          <h2 className="text-lg font-extrabold">{product.name}</h2>
          <ProductRatingSummary
            ratingAvg={product.ratingAvg}
            ratingCount={product.ratingCount}
            compact
          />
        </div>

        <div className="grid grid-cols-2 rounded-2xl bg-[#ECECEC] p-1">
          {/* tab buttons */}
        </div>
      </div>
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto">
      {activeTab === "config" ? (
        <ProductForm product={product} onSubmit={handleClose} />
      ) : (
        <ProductReviews productId={product.id} variant="modal" />
      )}
    </div>
  </div>
</Modal>
```

Важно: `Modal` должен иметь `overflow-hidden`, а scroll должен жить внутри контентного блока.

### 5. Оформить tabs как segmented control

Создать список вкладок:

```tsx
const tabs = [
  { value: "config", label: "Настроить" },
  { value: "reviews", label: "Отзывы" },
] as const;
```

Кнопки:

```tsx
{tabs.map((tab) => (
  <button
    key={tab.value}
    type="button"
    onClick={() => setActiveTab(tab.value)}
    className={cn(
      "min-h-10 rounded-xl px-4 text-sm font-bold transition-colors",
      activeTab === tab.value
        ? "bg-white text-primary shadow-sm"
        : "text-gray-500 hover:text-gray-900",
    )}
  >
    {tab.label}
  </button>
))}
```

### 6. Не ломать кнопку закрытия

Текущий `Modal` уже рисует крестик закрытия. В header нужно оставить `pr-10`, чтобы название, рейтинг и tabs не залезали под крестик.

### 7. Не обязательно менять `ProductForm`

Если tabs сверху достаточно заметны, `ProductForm` можно не трогать.

Если хочется сделать рейтинг кликабельным внутри формы, добавить optional prop:

```ts
onReviewsClick?: () => void;
```

И рядом с `ProductRatingSummary` добавить кнопку:

```tsx
<button type="button" onClick={onReviewsClick}>
  Отзывы
</button>
```

Но это необязательно, потому что tabs уже решают навигацию.

## Лучшее итоговое поведение

- Пользователь кликает товар в каталоге.
- Открывается модалка.
- Сверху видит название, компактный рейтинг и tabs.
- `Настроить` показывает текущую настройку товара.
- `Отзывы` показывает список отзывов в той же модалке.
- Закрытие модалки работает как раньше.
- После добавления товара в корзину `onSubmit` закрывает модалку только из вкладки `Настроить`.

## Что проверить после реализации

```bash
cd client
npm run lint
npm run build
```

Проверить вручную:

- `/` -> клик по товару -> модалка открывается.
- Вкладка `Настроить` работает как раньше.
- Вкладка `Отзывы` не раздувает модалку и скроллится внутри.
- На mobile tabs не перекрываются крестиком.
- `/product/[id]` всё ещё показывает отзывы снизу как обычная страница.
- Добавление в корзину закрывает модалку как раньше.
