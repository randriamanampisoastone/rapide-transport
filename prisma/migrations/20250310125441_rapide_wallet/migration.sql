/*
  Warnings:

  - The values [BALANCE] on the enum `PaymentMethodType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethodType_new" AS ENUM ('CASH', 'MVOLA', 'ORANGE_MONEY', 'PROMO', 'RAPIDE_WALLET');
ALTER TABLE "RideInvoice" ALTER COLUMN "paymentMethodType" TYPE "PaymentMethodType_new" USING ("paymentMethodType"::text::"PaymentMethodType_new");
ALTER TABLE "Ride" ALTER COLUMN "paymentMethodType" TYPE "PaymentMethodType_new" USING ("paymentMethodType"::text::"PaymentMethodType_new");
ALTER TABLE "PaymentTransaction" ALTER COLUMN "paymentMethod" TYPE "PaymentMethodType_new" USING ("paymentMethod"::text::"PaymentMethodType_new");
ALTER TYPE "PaymentMethodType" RENAME TO "PaymentMethodType_old";
ALTER TYPE "PaymentMethodType_new" RENAME TO "PaymentMethodType";
DROP TYPE "PaymentMethodType_old";
COMMIT;
