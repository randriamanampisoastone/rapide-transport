/*
  Warnings:

  - A unique constraint covering the columns `[rideInvoiceId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RideInvoice" ADD COLUMN     "paymentTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_rideInvoiceId_key" ON "PaymentTransaction"("rideInvoiceId");
