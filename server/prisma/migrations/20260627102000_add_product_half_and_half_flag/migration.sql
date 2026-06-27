ALTER TABLE "products"
ADD COLUMN "can_build_half_and_half" BOOLEAN NOT NULL DEFAULT false;

UPDATE "products"
SET "can_build_half_and_half" = true
WHERE "name" IN ('Сырная', 'Терияки', 'Колбаски Барбекю', 'Додо');
