CREATE TABLE "favorite_products" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "favorite_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "favorite_products_user_id_product_id_key"
ON "favorite_products"("user_id", "product_id");

CREATE INDEX "favorite_products_user_id_created_at_idx"
ON "favorite_products"("user_id", "created_at");

CREATE INDEX "favorite_products_product_id_idx"
ON "favorite_products"("product_id");

ALTER TABLE "favorite_products"
ADD CONSTRAINT "favorite_products_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorite_products"
ADD CONSTRAINT "favorite_products_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
