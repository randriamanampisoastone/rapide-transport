/*
  Warnings:

  - You are about to drop the column `estimatedPriceLower` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedPriceUpper` on the `Ride` table. All the data in the column will be lost.
  - Added the required column `estimatedPrice` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ride" DROP COLUMN "estimatedPriceLower",
DROP COLUMN "estimatedPriceUpper",
ADD COLUMN     "estimatedPrice" TEXT NOT NULL;
