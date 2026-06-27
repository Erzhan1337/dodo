ALTER TABLE "cart_items"
ADD COLUMN "custom_name" TEXT,
ADD COLUMN "custom_details" JSONB,
ADD COLUMN "custom_unit_price" INTEGER;

ALTER TABLE "order_items"
ADD COLUMN "custom_name" TEXT,
ADD COLUMN "custom_details" JSONB;
