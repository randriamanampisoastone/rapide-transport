-- DropForeignKey
ALTER TABLE "RideInvoice" DROP CONSTRAINT "RideInvoice_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "RideInvoice" DROP CONSTRAINT "RideInvoice_driverProfileId_fkey";

-- AlterTable
ALTER TABLE "RideInvoice" ALTER COLUMN "clientProfileId" DROP NOT NULL,
ALTER COLUMN "driverProfileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RideInvoice" ADD CONSTRAINT "RideInvoice_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideInvoice" ADD CONSTRAINT "RideInvoice_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE SET NULL ON UPDATE CASCADE;
