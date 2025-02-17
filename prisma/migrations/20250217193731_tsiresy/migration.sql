/*
  Warnings:

  - Made the column `completeRide` on table `DriverProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "cancelledRide" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completeRide" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DriverProfile" ALTER COLUMN "completeRide" SET NOT NULL;
