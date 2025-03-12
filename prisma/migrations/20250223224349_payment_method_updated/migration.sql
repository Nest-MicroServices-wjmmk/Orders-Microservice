/*
  Warnings:

  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY', 'AMAZON_PAY', 'CASH');

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "paid" SET DEFAULT false,
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL;
