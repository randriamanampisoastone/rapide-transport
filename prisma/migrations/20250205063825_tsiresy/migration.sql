/*
  Warnings:

  - You are about to drop the column `dropOffLocationPlusCode` on the `RideInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `pickUpLocationPlusCode` on the `RideInvoice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RideInvoice` table. All the data in the column will be lost.
  - You are about to drop the `Ride` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dropOffLatitude` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropOffLongitude` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encodedPolyline` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedDuration` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedPriceLower` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedPriceUpper` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethodType` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickUpLatitude` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickUpLongitude` to the `RideInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RideInvoice" DROP COLUMN "dropOffLocationPlusCode",
DROP COLUMN "pickUpLocationPlusCode",
DROP COLUMN "updatedAt",
ADD COLUMN     "dropOffLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dropOffLongitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "encodedPolyline" TEXT NOT NULL,
ADD COLUMN     "endTime" DOUBLE PRECISION,
ADD COLUMN     "estimatedDuration" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estimatedPriceLower" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "estimatedPriceUpper" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "note" DOUBLE PRECISION,
ADD COLUMN     "paymentMethodType" "PaymentMethodType" NOT NULL,
ADD COLUMN     "pickUpLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pickUpLongitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "startTime" DOUBLE PRECISION,
ADD COLUMN     "status" "RideStatus",
ADD COLUMN     "updateAt" TEXT,
ADD COLUMN     "vehicleId" TEXT,
ALTER COLUMN "realDuration" DROP NOT NULL,
ALTER COLUMN "realPrice" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "createdAt" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Ride";
