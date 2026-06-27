CREATE SEQUENCE "orders_order_number_seq";

ALTER TABLE "orders"
ADD COLUMN "order_number" INTEGER;

WITH numbered_orders AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "created_at" ASC, "id" ASC) AS "order_number"
  FROM "orders"
)
UPDATE "orders"
SET "order_number" = numbered_orders."order_number"
FROM numbered_orders
WHERE "orders"."id" = numbered_orders."id";

SELECT setval(
  '"orders_order_number_seq"',
  COALESCE((SELECT MAX("order_number") FROM "orders"), 0) + 1,
  false
);

ALTER TABLE "orders"
ALTER COLUMN "order_number" SET NOT NULL,
ALTER COLUMN "order_number" SET DEFAULT nextval('"orders_order_number_seq"');

ALTER SEQUENCE "orders_order_number_seq" OWNED BY "orders"."order_number";

CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");
