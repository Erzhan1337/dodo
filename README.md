# 404 Pizza

Full-stack приложение для онлайн-заказа пиццы: каталог, фильтры, карточка товара, избранное, конструктор собственной пиццы, корзина, checkout, личный кабинет, история заказов, realtime-статусы и админ-панель для управления магазином.

Проект состоит из двух независимых частей:

- `client` - Next.js приложение на App Router.
- `server` - NestJS API с Prisma и PostgreSQL.

## Содержание

- [Возможности](#возможности)
- [Технологии](#технологии)
- [Архитектура](#архитектура)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Скрипты](#скрипты)
- [Маршруты клиента](#маршруты-клиента)
- [API](#api)
- [Realtime-статусы заказов](#realtime-статусы-заказов)

## Возможности

- Каталог товаров с категориями, поиском, пагинацией, сортировкой и фильтрами.
- Фильтрация по цене, категории и ингредиентам.
- Рейтинг товаров и сортировка каталога по средним оценкам.
- Избранное для авторизованных пользователей:
  - добавление и удаление из каталога и карточки товара;
  - отдельная страница избранного;
  - счётчик избранных товаров в header;
  - оптимистичное обновление интерфейса.
- Отзывы к товарам:
  - оценка доступна только авторизованному пользователю;
  - оценить можно только товар из своего успешного заказа;
  - один отзыв привязан к одной позиции заказа;
  - средний рейтинг товара пересчитывается транзакционно.
- Карточка товара как отдельная страница и как модальное окно через intercepting routes Next.js.
- Конструктор пиццы:
  - выбор базовой пиццы;
  - размер и тип теста;
  - соус, сыр, нарезка и запекание;
  - дополнительные ингредиенты;
  - удаление базовых ингредиентов;
  - режим "две половинки";
  - пересчёт цены, веса и состава в интерфейсе.
- Корзина для авторизованных пользователей и гостей.
- Гостевая корзина хранится через cookie-токен и сливается с аккаунтом при входе или регистрации.
- Оформление заказа для гостя или авторизованного пользователя.
- Страница заказа с realtime-обновлением статуса через Socket.IO.
- Личный кабинет с профилем, адресом и историей заказов.
- JWT-аутентификация с access token на клиенте и refresh token в httpOnly cookie.
- Админ-панель:
  - dashboard с выручкой, заказами, пользователями и топом товаров;
  - CRUD товаров, категорий, ингредиентов и пользователей;
  - просмотр, фильтрация, сортировка, смена статуса и удаление заказов;
  - realtime-обновление списка заказов при новых заказах и смене статусов;
  - модерация отзывов;
  - роли `CUSTOMER` и `ADMIN`.
- Skeleton/loading-состояния и адаптивный интерфейс для mobile/tablet/desktop.

## Технологии

### Frontend

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- TanStack React Query
- Zustand
- React Hook Form, Zod
- Axios
- Socket.IO Client
- Framer Motion
- Recharts
- Lucide React

### Backend

- NestJS 11, TypeScript
- PostgreSQL 16
- Prisma ORM
- JWT access/refresh authentication
- Passport JWT
- Argon2
- class-validator / class-transformer
- Socket.IO WebSocket gateway
- Docker Compose для локальной БД

## Архитектура

```txt
dodo/
|-- client/                         # Next.js приложение
|   |-- src/app/                    # App Router, layouts, pages, parallel/intercepting routes
|   |-- src/entities/               # Бизнес-сущности: product, cart, order, session, category
|   |-- src/features/               # Фичи: auth, filters, cart, checkout, admin, pizza-builder
|   |-- src/shared/                 # UI-kit, api instance, hooks, libs
|   |-- src/views/                  # Крупные страницы и layout-композиции
|   `-- src/widgets/                # Header, topbar, product-list, product-modal, filters
|
`-- server/                         # NestJS API
    |-- src/admin/                  # Админ API и dashboard
    |-- src/auth/                   # Auth, JWT strategy, guards, decorators
    |-- src/cart/                   # Корзина пользователя и гостя
    |-- src/categories/             # Категории
    |-- src/health/                 # Healthcheck
    |-- src/favorites/              # Избранные товары пользователя
    |-- src/ingredients/            # Ингредиенты
    |-- src/order/                  # Заказы и WebSocket-события
    |-- src/prisma/                 # Prisma service/module
    |-- src/product/                # Каталог и карточка товара
    |-- src/reviews/                # Отзывы и рейтинги товаров
    |-- src/user/                   # Профиль пользователя
    `-- prisma/                     # Schema, migrations, seed
```

### Основные сущности БД

- `User` - пользователь, профиль, роль, refresh token.
- `Category` - категория товаров.
- `Product` - пицца или продукт каталога.
- `ProductItem` - конкретный вариант продукта: размер, тип теста, цена.
- `Ingredient` - ингредиент с ценой и изображением.
- `Cart` / `CartItem` - корзина пользователя или гостя.
- `Order` / `OrderItem` - заказ, состав, получатель и статус.
- `ProductReview` - отзыв к купленной позиции заказа и источник рейтинга товара.
- `ProductFavorite` - избранные товары пользователя.

## Быстрый старт

### Требования

- Node.js 20+
- npm для `client`
- Yarn 1.x для `server`
- Docker и Docker Compose для локального PostgreSQL

### 1. Установка проекта

```bash
git clone https://github.com/erzhan1337/dodo.git
cd dodo
```

### 2. Запуск backend

```bash
cd server
cp .env.example .env
yarn install
docker compose up -d
npx prisma migrate dev
ALLOW_DESTRUCTIVE_SEED=true npx prisma db seed
yarn start:dev
```

API будет доступен на:

```txt
http://localhost:4000
```

Проверка healthcheck:

```bash
curl http://localhost:4000/health
```

Seed создаёт демо-данные, товары с изображениями и администратора:

```txt
phone: +77770000000
email: admin@404pizza.local
password: admin12345
```

Важно: seed очищает таблицы перед заполнением. Для защиты от случайного запуска требуется флаг `ALLOW_DESTRUCTIVE_SEED=true`. Для production-like окружений seed заблокирован.

### 3. Запуск frontend

В отдельном терминале:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Клиент будет доступен на:

```txt
http://localhost:3000
```

## Переменные окружения

### `client/.env`

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:4000"
```

### `server/.env`

```env
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"

POSTGRES_USER="dodo"
POSTGRES_PASSWORD="dodo"
POSTGRES_DB="dodo"
POSTGRES_PORT="5433"
DATABASE_URL="postgresql://dodo:dodo@localhost:5433/dodo?schema=public"

CLIENT_URL="http://localhost:3000"
PRODUCTION="false"
```

Для production-cookie дополнительно нужен домен сервера:

```env
SERVER_DOMAIN="example.com"
PRODUCTION="true"
```

Если меняете `POSTGRES_PORT`, синхронно обновите порт в `DATABASE_URL`.

## Скрипты

### Client

```bash
npm run dev      # dev server Next.js
npm run build    # production build
npm run start    # запуск production build
npm run lint     # ESLint
```

### Server

```bash
yarn start       # запуск NestJS
yarn start:dev   # dev server with watch
yarn build       # prisma generate + nest build
yarn start:prod  # запуск dist/main
yarn lint        # ESLint с --fix
yarn test        # Jest unit tests
```

Полезные Prisma-команды:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
ALLOW_DESTRUCTIVE_SEED=true npx prisma db seed
```

## Проверка перед коммитом

```bash
cd client
npm run lint
npm run build

cd ../server
yarn build
npx eslint "{src,apps,libs}/**/*.ts"
```

`yarn lint` на сервере запускает ESLint с `--fix`, поэтому для проверки без автоисправлений удобнее использовать прямой вызов `npx eslint`.

## Маршруты клиента

| Маршрут | Назначение |
| --- | --- |
| `/` | Главная страница с каталогом, категориями, фильтрами и пагинацией. |
| `/product/[id]` | Полная страница продукта. |
| `/(.)product/[id]` | Модальное окно продукта через intercepting route. |
| `/pizza-constructor` | Конструктор собственной пиццы. |
| `/cart` | Корзина. |
| `/checkout` | Оформление заказа. |
| `/favorites` | Избранные товары пользователя. |
| `/order/[token]` | Страница созданного заказа и realtime-статус. |
| `/orders` | История заказов пользователя. |
| `/profile` | Профиль и адрес доставки. |
| `/login` | Вход. |
| `/register` | Регистрация. |
| `/admin` | Dashboard админ-панели. |
| `/admin/products` | Управление товарами. |
| `/admin/reviews` | Модерация отзывов и оценок. |
| `/admin/categories` | Управление категориями. |
| `/admin/ingredients` | Управление ингредиентами. |
| `/admin/orders` | Управление заказами. |
| `/admin/users` | Управление пользователями и ролями. |

## API

Base URL по умолчанию:

```txt
http://localhost:4000
```

### Auth

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `POST` | `/auth/login` | Вход по телефону и паролю. |
| `POST` | `/auth/register` | Регистрация пользователя. |
| `POST` | `/auth/login/access-token` | Обновление access token через refresh cookie. |
| `POST` | `/auth/logout` | Выход и очистка refresh cookie. |

### Catalog

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/product/all` | Список товаров с фильтрами, сортировкой и пагинацией. |
| `GET` | `/product/:id` | Один товар. |
| `GET` | `/categories` | Список категорий. |
| `GET` | `/ingredients` | Список ингредиентов. |
| `GET` | `/reviews/product/:productId` | Отзывы товара. |

`GET /product/all` поддерживает query-параметры:

| Параметр | Описание |
| --- | --- |
| `from` / `to` | Диапазон цены. |
| `ingredients` | Список названий ингредиентов через запятую. |
| `category` | ID категории. |
| `sort` | `rating`, `asc` или `desc`. По умолчанию используется `rating`. |
| `query` | Поиск по названию. |
| `page` / `limit` | Пагинация. `limit` максимум 50. |

### Cart

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/cart` | Текущая корзина пользователя или гостя. |
| `POST` | `/cart` | Добавление товара в корзину. |
| `PATCH` | `/cart/:id` | Изменение количества позиции. |
| `DELETE` | `/cart/:id` | Удаление позиции. |
| `DELETE` | `/cart/:itemId/ingredients/:ingredientId` | Удаление ингредиента из позиции. |

### Orders

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `POST` | `/order` | Создание заказа из текущей корзины. |
| `GET` | `/order/my` | Заказы текущего пользователя. Требует авторизации. |
| `GET` | `/order/:token` | Заказ по публичному token. |

### Reviews

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/reviews/product/:productId` | Публичный список отзывов товара. |
| `GET` | `/reviews/my` | Отзывы текущего пользователя. Требует авторизации. |
| `POST` | `/reviews` | Создание отзыва к своей позиции успешного заказа. |
| `PATCH` | `/reviews/:id` | Обновление своего отзыва. |
| `DELETE` | `/reviews/:id` | Удаление своего отзыва. |

### Favorites

Все `/favorites/*` endpoints требуют авторизации.

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/favorites` | Список избранных товаров текущего пользователя. |
| `GET` | `/favorites/ids` | ID избранных товаров для быстрого отображения состояния в UI. |
| `POST` | `/favorites/:productId` | Добавление товара в избранное. |
| `DELETE` | `/favorites/:productId` | Удаление товара из избранного. |

Статусы заказа:

- `PENDING` - принят, ожидает оплаты.
- `SUCCEEDED` - оплачен.
- `CANCELED` - отменён.

### User

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/user/me` | Текущий пользователь. |
| `PATCH` | `/user/me` | Обновление профиля. |

### Admin

Все `/admin/*` endpoints требуют авторизации и роль `ADMIN`.

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Метрики dashboard. |
| `GET` | `/admin/products` | Список товаров с поиском, сортировкой и пагинацией. |
| `GET` | `/admin/products/:id` | Один товар для редактирования. |
| `POST` | `/admin/products` | Создание товара. |
| `PATCH` | `/admin/products/:id` | Обновление товара. |
| `DELETE` | `/admin/products/:id` | Удаление товара. |
| `GET` | `/admin/orders` | Список заказов. |
| `GET` | `/admin/orders/:id` | Детали заказа. |
| `PATCH` | `/admin/orders/:id/status` | Смена статуса заказа. |
| `DELETE` | `/admin/orders/:id` | Удаление заказа. |
| `GET` | `/admin/reviews` | Список отзывов с поиском, фильтром и сортировкой. |
| `DELETE` | `/admin/reviews/:id` | Удаление отзыва с пересчётом рейтинга товара. |
| `GET` | `/admin/users` | Список пользователей. |
| `POST` | `/admin/users` | Создание пользователя. |
| `PATCH` | `/admin/users/:id` | Обновление пользователя. |
| `DELETE` | `/admin/users/:id` | Удаление пользователя. |
| `GET` | `/admin/categories` | Список категорий. |
| `POST` | `/admin/categories` | Создание категории. |
| `PATCH` | `/admin/categories/:id` | Обновление категории. |
| `DELETE` | `/admin/categories/:id` | Удаление категории. |
| `GET` | `/admin/ingredients` | Список ингредиентов. |
| `POST` | `/admin/ingredients` | Создание ингредиента. |
| `PATCH` | `/admin/ingredients/:id` | Обновление ингредиента. |
| `DELETE` | `/admin/ingredients/:id` | Удаление ингредиента. |

### Healthcheck

| Метод | Endpoint | Описание |
| --- | --- | --- |
| `GET` | `/health` | Проверка доступности API. |

## Realtime-статусы заказов

Сервер использует Socket.IO gateway в модуле заказов.

Клиент подключается к `NEXT_PUBLIC_SERVER_URL`, подписывается на комнату заказа по token и получает обновления при смене статуса в админ-панели.

События:

| Событие | Направление | Описание |
| --- | --- | --- |
| `order:subscribe` | client -> server | Подписка на заказ по token. |
| `order:unsubscribe` | client -> server | Отписка от заказа. |
| `order:status` | server -> client | Новый статус заказа. |
| `order:error` | server -> client | Ошибка подписки или отсутствующий заказ. |
| `admin:orders:subscribe` | admin client -> server | Подписка администратора на поток заказов с access token. |
| `admin:orders:unsubscribe` | admin client -> server | Отписка администратора от потока заказов. |
| `admin:orders:ready` | server -> admin client | Подписка администратора активирована. |
| `admin:orders:created` | server -> admin client | Создан новый заказ. |
| `admin:orders:updated` | server -> admin client | Заказ изменён, например сменился статус. |
| `admin:orders:deleted` | server -> admin client | Заказ удалён из админ-панели. |
| `admin:orders:error` | server -> admin client | Ошибка авторизации или подписки администратора. |

## Troubleshooting

- Если frontend не видит API, проверьте `NEXT_PUBLIC_SERVER_URL` в `client/.env`.
- Если CORS или cookie не работают, проверьте `CLIENT_URL` в `server/.env`.
- Если PostgreSQL не стартует из-за занятого порта, измените `POSTGRES_PORT` и порт в `DATABASE_URL`.
- Если seed отказывается запускаться, убедитесь, что окружение не production-like и команда содержит `ALLOW_DESTRUCTIVE_SEED=true`.
- Если админ-панель возвращает `403`, войдите под пользователем с ролью `ADMIN`. Демо-админ создаётся seed-скриптом.
