-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "clientExpoToken" TEXT,
ADD COLUMN     "driverExpoToken" TEXT;

-- AlterTable
ALTER TABLE "RideInvoice" ADD COLUMN     "clientExpoToken" TEXT,
ADD COLUMN     "driverExpoToken" TEXT;
