-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "product_items_product_id_size_price_idx" ON "product_items"("product_id", "size", "price");

-- CreateIndex
CREATE INDEX "product_items_price_idx" ON "product_items"("price");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_item_id_idx" ON "order_items"("product_item_id");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_created_at_idx" ON "cart_items"("cart_id", "created_at");

-- CreateIndex
CREATE INDEX "cart_items_product_item_id_idx" ON "cart_items"("product_item_id");
