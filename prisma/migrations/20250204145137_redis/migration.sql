-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'MVOLA', 'ORANGE_MONEY', 'PROMO');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('FINDING_DRIVER', 'CANCELLED', 'DRIVER_ACCEPTED', 'DRIVER_ON_THE_WAY', 'STOPPED', 'DRIVER_ARRIVED', 'CLIENT_NOT_FOUND', 'ON_RIDE', 'CLIENT_GIVE_UP', 'ARRIVED_DESTINATION', 'COMPLETED', 'ADMIN_CHECK');

-- CreateTable
CREATE TABLE "Ride" (
    "rideId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "paymentMethodType" "PaymentMethodType" NOT NULL,
    "pickUpLatitude" DOUBLE PRECISION NOT NULL,
    "pickUpLongitude" DOUBLE PRECISION NOT NULL,
    "dropOffLatitude" DOUBLE PRECISION NOT NULL,
    "dropOffLongitude" DOUBLE PRECISION NOT NULL,
    "encodedPolyline" TEXT NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" DOUBLE PRECISION NOT NULL,
    "estimatedPriceLower" DOUBLE PRECISION NOT NULL,
    "estimatedPriceUpper" DOUBLE PRECISION NOT NULL,
    "realDuration" DOUBLE PRECISION NOT NULL,
    "realPrice" DOUBLE PRECISION,
    "status" "RideStatus",
    "note" DOUBLE PRECISION,
    "review" TEXT,
    "startTime" DOUBLE PRECISION,
    "endTime" DOUBLE PRECISION,
    "createdAt" TEXT,
    "updateAt" TEXT,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("rideId")
);
