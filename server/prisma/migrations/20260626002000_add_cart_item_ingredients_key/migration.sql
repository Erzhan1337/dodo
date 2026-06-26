-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN "ingredients_key" TEXT NOT NULL DEFAULT '';

-- Backfill normalized ingredient identity for existing cart items.
UPDATE "cart_items" AS "cart_item"
SET "ingredients_key" = COALESCE("ingredient_keys"."ingredients_key", '')
FROM (
    SELECT
        "A" AS "cart_item_id",
        string_agg("B", ',' ORDER BY "B") AS "ingredients_key"
    FROM "_CartItemToIngredient"
    GROUP BY "A"
) AS "ingredient_keys"
WHERE "cart_item"."id" = "ingredient_keys"."cart_item_id";

-- Merge existing duplicate cart items before adding the unique constraint.
WITH "ranked_cart_items" AS (
    SELECT
        "id",
        FIRST_VALUE("id") OVER (
            PARTITION BY "cart_id", "product_item_id", "ingredients_key"
            ORDER BY "created_at", "id"
        ) AS "keep_id",
        SUM("quantity") OVER (
            PARTITION BY "cart_id", "product_item_id", "ingredients_key"
        ) AS "total_quantity",
        ROW_NUMBER() OVER (
            PARTITION BY "cart_id", "product_item_id", "ingredients_key"
            ORDER BY "created_at", "id"
        ) AS "row_number"
    FROM "cart_items"
),
"deduplicated_cart_items" AS (
    UPDATE "cart_items" AS "cart_item"
    SET "quantity" = "ranked_cart_items"."total_quantity"
    FROM "ranked_cart_items"
    WHERE "cart_item"."id" = "ranked_cart_items"."keep_id"
        AND "ranked_cart_items"."row_number" = 1
    RETURNING "cart_item"."id"
)
DELETE FROM "cart_items" AS "cart_item"
USING "ranked_cart_items"
WHERE "cart_item"."id" = "ranked_cart_items"."id"
    AND "ranked_cart_items"."row_number" > 1;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_item_id_ingredients_key_key" ON "cart_items"("cart_id", "product_item_id", "ingredients_key");
