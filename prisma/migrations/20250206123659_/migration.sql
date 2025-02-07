-- CreateTable
CREATE TABLE "Ride" (
    "rideId" TEXT NOT NULL,
    "clientProfileId" TEXT,
    "driverProfileId" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "vehicleId" TEXT,
    "paymentMethodType" "PaymentMethodType" NOT NULL,
    "pickUpLocation" TEXT NOT NULL,
    "dropOffLocation" TEXT NOT NULL,
    "encodedPolyline" TEXT NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" DOUBLE PRECISION NOT NULL,
    "estimatedPriceLower" DOUBLE PRECISION NOT NULL,
    "estimatedPriceUpper" DOUBLE PRECISION NOT NULL,
    "realDuration" DOUBLE PRECISION,
    "realPrice" DOUBLE PRECISION,
    "status" "RideStatus",
    "note" DOUBLE PRECISION,
    "review" TEXT,
    "startTime" DOUBLE PRECISION,
    "endTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("rideId")
);

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE SET NULL ON UPDATE CASCADE;
