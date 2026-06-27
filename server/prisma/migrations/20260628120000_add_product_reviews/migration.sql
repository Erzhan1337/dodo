ALTER TABLE "products"
ADD COLUMN "rating_avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "rating_sum" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "rating_count" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "product_reviews" (
  "id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "product_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "order_item_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "product_reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE UNIQUE INDEX "product_reviews_order_item_id_key" ON "product_reviews"("order_item_id");
CREATE INDEX "products_rating_avg_rating_count_idx" ON "products"("rating_avg", "rating_count");
CREATE INDEX "product_reviews_product_id_created_at_idx" ON "product_reviews"("product_id", "created_at");
CREATE INDEX "product_reviews_user_id_created_at_idx" ON "product_reviews"("user_id", "created_at");
CREATE INDEX "product_reviews_rating_idx" ON "product_reviews"("rating");

ALTER TABLE "product_reviews"
ADD CONSTRAINT "product_reviews_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_reviews"
ADD CONSTRAINT "product_reviews_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_reviews"
ADD CONSTRAINT "product_reviews_order_item_id_fkey"
FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
