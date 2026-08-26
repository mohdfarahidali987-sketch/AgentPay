/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- Add SKU as nullable first
ALTER TABLE "Product"
ADD COLUMN "sku" TEXT;

-- Populate SKU for existing products
UPDATE "Product"
SET "sku" = CASE
    WHEN "name" = 'Logitech Wireless Mouse'
        THEN 'AGENT-MOUSE-001'

    WHEN "name" = 'Mechanical Keyboard'
        THEN 'AGENT-KEYBOARD-001'

    WHEN "name" = 'USB-C Hub'
        THEN 'AGENT-HUB-001'

    WHEN "name" = '1TB NVMe SSD'
        THEN 'AGENT-SSD-001'

    WHEN "name" = 'Laptop Stand'
        THEN 'AGENT-STAND-001'

    WHEN "name" = 'Wireless Headphones'
        THEN 'AGENT-HEADPHONES-001'

    WHEN "name" = 'Webcam 1080p'
        THEN 'AGENT-WEBCAM-001'

    WHEN "name" = 'Portable Power Bank'
        THEN 'AGENT-POWERBANK-001'

    ELSE 'AGENT-PRODUCT-' || "id"
END;

-- SKU is now present for every existing product
ALTER TABLE "Product"
ALTER COLUMN "sku" SET NOT NULL;

-- SKU must be unique
CREATE UNIQUE INDEX "Product_sku_key"
ON "Product"("sku");