CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'CANCELED', 'FAILED');

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "provider_checkout_id" TEXT,
  "provider_payment_intent_id" TEXT,
  "checkout_url" TEXT,
  "paid_at" TIMESTAMP(3),
  "canceled_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "order_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_webhook_events" (
  "id" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "provider_event_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_provider_checkout_id_key"
ON "payments"("provider_checkout_id");

CREATE UNIQUE INDEX "payments_provider_payment_intent_id_key"
ON "payments"("provider_payment_intent_id");

CREATE UNIQUE INDEX "payments_order_id_key"
ON "payments"("order_id");

CREATE INDEX "payments_status_created_at_idx"
ON "payments"("status", "created_at");

CREATE UNIQUE INDEX "payment_webhook_events_provider_event_id_key"
ON "payment_webhook_events"("provider_event_id");

ALTER TABLE "payments"
ADD CONSTRAINT "payments_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
