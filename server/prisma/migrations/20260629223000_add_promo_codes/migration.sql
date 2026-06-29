CREATE TYPE "PromoCodeType" AS ENUM ('PERCENT', 'FIXED_AMOUNT');

CREATE TABLE "promo_codes" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "PromoCodeType" NOT NULL,
  "value" INTEGER NOT NULL,
  "min_order_amount" INTEGER NOT NULL DEFAULT 0,
  "max_discount_amount" INTEGER,
  "usage_limit" INTEGER,
  "per_user_limit" INTEGER,
  "first_order_only" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "starts_at" TIMESTAMP(3),
  "ends_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "promo_code_redemptions" (
  "id" TEXT NOT NULL,
  "discount_amount" INTEGER NOT NULL,
  "promo_code_id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "promo_code_redemptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "carts"
ADD COLUMN "subtotal_price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "discount_amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "promo_code_id" TEXT;

UPDATE "carts"
SET "subtotal_price" = "total_price";

ALTER TABLE "orders"
ADD COLUMN "subtotal_price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "discount_amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "promo_code_id" TEXT,
ADD COLUMN "promo_code_snapshot" JSONB;

UPDATE "orders"
SET "subtotal_price" = "total_price";

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE INDEX "promo_codes_is_active_starts_at_ends_at_idx"
ON "promo_codes"("is_active", "starts_at", "ends_at");
CREATE UNIQUE INDEX "promo_code_redemptions_order_id_key"
ON "promo_code_redemptions"("order_id");
CREATE INDEX "promo_code_redemptions_promo_code_id_created_at_idx"
ON "promo_code_redemptions"("promo_code_id", "created_at");
CREATE INDEX "promo_code_redemptions_user_id_promo_code_id_idx"
ON "promo_code_redemptions"("user_id", "promo_code_id");
CREATE INDEX "carts_promo_code_id_idx" ON "carts"("promo_code_id");
CREATE INDEX "orders_promo_code_id_idx" ON "orders"("promo_code_id");

ALTER TABLE "carts"
ADD CONSTRAINT "carts_promo_code_id_fkey"
FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "orders"
ADD CONSTRAINT "orders_promo_code_id_fkey"
FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions"
ADD CONSTRAINT "promo_code_redemptions_promo_code_id_fkey"
FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions"
ADD CONSTRAINT "promo_code_redemptions_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "promo_code_redemptions"
ADD CONSTRAINT "promo_code_redemptions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
