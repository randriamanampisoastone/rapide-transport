/*
  Warnings:

  - Changed the type of `vehicleType` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTO', 'LITE_CAR', 'PREMIUM_CAR');

-- AlterTable
ALTER TABLE "AccountBalance" ALTER COLUMN "balanceStatus" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleType" "VehicleType" NOT NULL;
