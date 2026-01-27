🍕 Dodo Pizza Clone
A full-stack web application for pizza delivery inspired by Dodo Pizza. This project features a modern client interface built with Next.js and a robust backend powered by NestJS.
📋 Table of Contents

Features
Technology Stack
Prerequisites
Installation
Environment Configuration
Running the Application
Project Structure
API Documentation
Contributing
License

✨ Features
Core Functionality

Complete Order Flow: Browse products, customize ingredients, add to cart, and complete checkout
Product Customization: Choose crust type, pizza size, and add/remove ingredients
Advanced Filtering: Filter by price, ingredients, categories with full-text search
User Authentication: Registration and login with JWT tokens and Argon2 password hashing
Shopping Cart: Real-time synchronization and quantity management
User Dashboard: View order history and track deliveries

Technical Highlights

Server-side rendering with Next.js App Router
Type-safe API with TypeScript and Prisma
Optimistic UI updates with TanStack Query
Responsive design with Tailwind CSS
Form validation with React Hook Form and Zod

🛠 Technology Stack
Frontend (Client)

Framework: Next.js 16 (App Router)
Language: TypeScript
State Management: Zustand
Server State: TanStack Query (React Query)
Styling: Tailwind CSS v4, Framer Motion
UI Components: Radix UI, Lucide React
Form Handling: React Hook Form + Zod
HTTP Client: Axios

Backend (Server)

Framework: NestJS 11
Language: TypeScript
Database: PostgreSQL
ORM: Prisma
Authentication: Passport.js, JWT
Validation: Class Validator

📦 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v20 or higher)
npm or yarn or bun
PostgreSQL (v14 or higher)

🚀 Installation
1. Clone the Repository
bashgit clone https://github.com/erzhan1337/dodo.git
cd dodo
2. Backend Setup
Navigate to the server directory and install dependencies:
bashcd server
npm install
# or
yarn install
3. Frontend Setup
Navigate to the client directory and install dependencies:
bashcd client
npm install
# or
bun install
⚙️ Environment Configuration
Backend Environment Variables
Create a .env file in the server directory:
env# Server Configuration
PORT=4200

# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dodo_db?schema=public"

# Authentication
JWT_SECRET="your_secret_key_here"
JWT_EXPIRATION="7d"

# Optional: API Keys
# STRIPE_SECRET_KEY="your_stripe_key"
# SENDGRID_API_KEY="your_sendgrid_key"
Frontend Environment Variables
Create a .env.local file in the client directory:
env# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:4200"

# Optional: Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
🗄️ Database Setup
Initialize the Database
bashcd server

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data (optional)
npm run prisma:seed
# or
yarn prisma:seed
View Database (Optional)
bash# Open Prisma Studio
npx prisma studio
This will open a browser interface at http://localhost:5555 to view and manage your database.
🏃 Running the Application
Development Mode
Backend:
bashcd server
npm run start:dev
# or
yarn start:dev
The API will be available at http://localhost:4200
Frontend:
bashcd client
npm run dev
# or
bun dev
The application will be available at http://localhost:3000
Production Build
Backend:
bashcd server
npm run build
npm run start:prod
Frontend:
bashcd client
npm run build
npm start
📂 Project Structure
dodo/
├── client/                   # Frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── (auth)/      # Authentication pages
│   │   │   ├── (main)/      # Main application pages
│   │   │   └── layout.tsx   # Root layout
│   │   ├── features/        # Business logic modules
│   │   │   ├── cart/        # Shopping cart feature
│   │   │   ├── filters/     # Product filtering
│   │   │   └── auth/        # Authentication logic
│   │   └── shared/          # Reusable components
│   │       ├── components/  # UI components
│   │       ├── hooks/       # Custom React hooks
│   │       ├── lib/         # Utility functions
│   │       └── types/       # TypeScript types
│   └── public/              # Static assets
│
└── server/                  # Backend API
    ├── src/
    │   ├── auth/           # Authentication module
    │   ├── product/        # Product management
    │   ├── order/          # Order processing
    │   ├── user/           # User management
    │   ├── cart/           # Cart operations
    │   └── main.ts         # Application entry point
    └── prisma/
        ├── schema.prisma   # Database schema
        └── seed.ts         # Database seeding script
