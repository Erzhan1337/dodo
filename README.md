<div align="center">

# 🍕 Next Pizza

### Fullstack Pizza Delivery Service Clone

[![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)](https://github.com/erzhan1337/dodo)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)

[Live Demo](https://dodo-six-tau.vercel.app) · [Report Bug](https://github.com/erzhan1337/dodo/issues) · [Request Feature](https://github.com/erzhan1337/dodo/issues)

</div>

---

---

## 🎯 About The Project

**Next Pizza** is a modern, full-stack web application that replicates the core functionality of popular pizza delivery services. Built with cutting-edge technologies, it features a microservice-based monorepo architecture, complex cart logic, real-time product customization, and robust authentication system.

### Why This Project?

- 🎓 **Educational**: Demonstrates modern full-stack development practices
- 🏗️ **Production-Ready**: Built with scalability and maintainability in mind
- 🔧 **Comprehensive**: Covers authentication, state management, database design, and API development
- 🎨 **Beautiful UI**: Responsive design with smooth animations and intuitive UX

---


> 💡 **Note**: Replace placeholder images with actual screenshots from your project

---

## 🛠 Tech Stack

<div align="center">

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)](https://github.com/pmndrs/zustand)

### Backend

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=white)](http://www.passportjs.org/)

</div>

### 📦 Detailed Stack

<table>
<tr>
<td width="50%" valign="top">

#### **Frontend (Client)**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

</td>
<td width="50%" valign="top">

#### **Backend (Server)**

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon/Railway)
- **ORM**: Prisma
- **Authentication**: Passport.js
- **Token Strategy**: JWT (Access + Refresh)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger (planned)

</td>
</tr>
</table>

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎨 User Experience

- ✅ **Product Customization**
  - Multiple crust types (thin/traditional)
  - Size selection (S/M/L)
  - Custom ingredient selection
  - Real-time price updates

- ✅ **Smart Shopping Cart**
  - Automatic price calculation
  - Item quantity management
  - Persistent cart state
  - Summary with totals

- ✅ **Advanced Filtering**
  - Live search functionality
  - Price range filters
  - Ingredient-based filtering
  - Category navigation

</td>
<td width="50%">

### 🔧 Technical Features

- ✅ **Authentication & Security**
  - JWT-based authentication
  - Refresh token rotation
  - Protected routes
  - HTTP-only cookies

- ✅ **Data Validation**
  - Client-side validation (Zod)
  - Server-side validation (DTO)
  - Type-safe API contracts

- ✅ **Performance**
  - Server-side rendering (SSR)
  - Optimistic UI updates
  - Image optimization
  - Code splitting

</td>
</tr>
</table>

### 📱 Additional Features

- 🌐 Fully responsive design (mobile, tablet, desktop)
- 🎭 Smooth animations and transitions
- ♿ Accessibility-focused components
- 🚀 Fast page loads with Next.js optimizations
- 🔄 Real-time data synchronization

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

```bash
Node.js >= 18.x
npm >= 9.x or yarn >= 1.22.x
PostgreSQL >= 14.x
```

### Installation

Follow these steps to get your development environment running:

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/erzhan1337/dodo.git
cd dodo
```

#### 2️⃣ Backend Setup (Server)

```bash
# Navigate to server directory
cd server

# Install dependencies
yarn install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed

# Start the development server
yarn start:dev
# or
npm run start:dev
```

The backend server will start on `http://localhost:4000`

#### 3️⃣ Frontend Setup (Client)

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install
# or
yarn install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
# or
yarn dev
```

The frontend application will start on `http://localhost:3000`

#### 4️⃣ Access the Application

Open your browser and navigate to:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)

---

## 📁 Project Structure

```
dodo/
│
├── client/                     # Frontend Application (Next.js)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Auth-related pages
│   │   │   ├── (root)/         # Main application pages
│   │   │   └── api/            # API routes
│   │   ├── components/         # React components
│   │   │   ├── ui/             # UI primitives (Shadcn)
│   │   │   └── shared/         # Shared components
│   │   ├── features/           # Feature-based modules
│   │   │   ├── cart/           # Shopping cart logic
│   │   │   ├── filters/        # Product filtering
│   │   │   └── products/       # Product management
│   │   ├── lib/                # Utility functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand stores
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     # Backend Application (NestJS)
│   ├── prisma/                 # Database schema & migrations
│   │   ├── schema.prisma       # Prisma schema
│   │   ├── migrations/         # Migration files
│   │   └── seed.ts             # Database seeding
│   ├── src/
│   │   ├── auth/               # Authentication module
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   ├── guards/         # Auth guards
│   │   │   └── strategies/     # Passport strategies
│   │   ├── cart/               # Shopping cart module
│   │   ├── products/           # Products module
│   │   ├── users/              # Users module
│   │   ├── common/             # Shared utilities
│   │   └── main.ts             # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔐 Environment Variables

### Backend (server/.env)

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# CORS
CLIENT_URL="http://localhost:3000"
SERVER_DOMAIN="localhost"

# Production Flag
PRODUCTION="false"
```

### Frontend (client/.env.local)

```env
# API Configuration
NEXT_PUBLIC_SERVER_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

> ⚠️ **Security Note**: Never commit `.env` files to version control. Use `.env.example` as a template.

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |
| POST | `/auth/refresh` | Refresh access token | ✅ |
| GET | `/auth/me` | Get current user | ✅ |

### Products Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | ❌ |
| GET | `/products/:id` | Get product by ID | ❌ |
| GET | `/products/search` | Search products | ❌ |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user's cart | ✅ |
| POST | `/cart/items` | Add item to cart | ✅ |
| PATCH | `/cart/items/:id` | Update cart item | ✅ |
| DELETE | `/cart/items/:id` | Remove cart item | ✅ |

> 📖 Full API documentation will be available via Swagger UI at `/api/docs` (coming soon)

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 👨‍💻 Contact & Support

<div align="center">

**Erzhan**

[![GitHub](https://img.shields.io/badge/GitHub-@erzhan1337-181717?style=for-the-badge&logo=github)](https://github.com/erzhan1337)

**Project Link**: [https://github.com/erzhan1337/dodo](https://github.com/erzhan1337/dodo)

**Live Demo**: [https://dodo-six-tau.vercel.app](https://dodo-six-tau.vercel.app)

</div>

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ by [Erzhan](https://github.com/erzhan1337)

</div>
