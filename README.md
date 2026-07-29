<div align="center">
  <h1>404 Pizza</h1>
  <p><strong>Full-stack платформа для заказа пиццы</strong></p>
  <p>Каталог, конструктор, онлайн-оплата, личный кабинет и административная панель.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16">
    <img src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19">
    <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS 11">
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16">
    <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma 7">
  </p>
</div>

---

## О проекте

404 Pizza — адаптивное веб-приложение с полным циклом оформления заказа: от выбора и настройки пиццы до оплаты и отслеживания статуса.

| Направление | Что реализовано |
|---|---|
| Каталог | Поиск, фильтрация, категории, варианты товаров и отзывы |
| Конструктор | Размер, тесто, ингредиенты и пицца из двух половинок |
| Покупка | Гостевая корзина, промокоды, checkout и оплата через Stripe |
| Аккаунт | Профиль, избранное и история заказов |
| Realtime | Обновление статусов заказов через Socket.IO |
| Управление | Dashboard и управление товарами, заказами, пользователями и справочниками |

## Демо-доступ

| Роль | Телефон | Пароль | Доступ |
|---|---|---|---|
| Пользователь | `+77717717171` | `12345678` | Каталог, корзина, избранное, заказы и профиль |
| Администратор | `+77717717172` | `12345678` | Пользовательская часть и панель `/admin` |

> [!IMPORTANT]
> Эти данные предназначены только для локального и демонстрационного окружения.

## Технологии

| Frontend | Backend | Инфраструктура |
|---|---|---|
| Next.js 16 | NestJS 11 | PostgreSQL 16 |
| React 19 | Prisma ORM | Docker Compose |
| TypeScript | Passport и JWT | Stripe |
| Tailwind CSS 4 | Socket.IO | Prisma Migrations |
| TanStack Query и Zustand | Argon2 | Stripe Webhooks |

## Локальный запуск

### Требования

- Node.js 22 LTS
- Bun 1.3+
- Yarn 1.x
- Docker и Docker Compose

### 1. Клонирование

```bash
git clone https://github.com/Erzhan1337/dodo.git
cd dodo
```

### 2. Backend

```bash
cd server
cp .env.example .env
yarn install
docker compose up -d
yarn prisma migrate dev
ALLOW_DESTRUCTIVE_SEED=true yarn prisma db seed
yarn start:dev
```

> [!WARNING]
> Seed полностью очищает локальную базу перед добавлением тестовых данных.

### 3. Frontend

Откройте новый терминал:

```bash
cd client
cp .env.example .env
bun install
bun run dev
```

| Сервис | URL |
|---|---|
| Приложение | [localhost:3000](http://localhost:3000) |
| API | [localhost:4000](http://localhost:4000) |
| Healthcheck | [localhost:4000/health](http://localhost:4000/health) |

## Конфигурация

Шаблоны настроек находятся в `client/.env.example` и `server/.env.example`.

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | URL backend для клиентского приложения |
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `CLIENT_URL` | Разрешённый origin клиентского приложения |
| `JWT_ACCESS_SECRET` | Секрет access-токена |
| `JWT_REFRESH_SECRET` | Секрет refresh-токена |
| `SESSION_TOKEN_PEPPER` | Секрет для защиты сессий |
| `STRIPE_SECRET_KEY` | Секретный ключ Stripe |
| `STRIPE_WEBHOOK_SECRET` | Секрет подписи Stripe webhook |

> [!NOTE]
> В production замените тестовые секреты и адреса на реальные значения.

<details>
<summary><strong>Локальная проверка Stripe webhook</strong></summary>

Запустите Stripe CLI:

```bash
stripe listen --forward-to http://localhost:4000/payments/webhooks/stripe
```

Сохраните полученное значение `whsec_...` в `STRIPE_WEBHOOK_SECRET`.

</details>

## Структура

```text
dodo/
├── client/   Next.js-приложение
├── server/   NestJS API, Prisma и Docker Compose
└── README.md
```

Основные страницы: `/`, `/pizza-constructor`, `/cart`, `/checkout`, `/favorites`, `/orders`, `/profile` и `/admin`.

## Команды

| Область | Разработка | Проверка | Production |
|---|---|---|---|
| Frontend | `bun run dev` | `bun run lint` · `bun run build` | `bun run start` |
| Backend | `yarn start:dev` | `yarn lint` · `yarn build` | `yarn start:prod` |

Команды Prisma запускаются из папки `server`:

```bash
yarn prisma migrate dev
yarn prisma studio
ALLOW_DESTRUCTIVE_SEED=true yarn prisma db seed
```
