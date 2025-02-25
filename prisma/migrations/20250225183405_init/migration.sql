-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTO', 'LITE_CAR', 'PREMIUM_CAR');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'TRANSFERT', 'RETRAIT');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'ARCHIVED', 'DEACTIVATED', 'CLOSED', 'UNDER_REVIEW', 'UNVERIFIED', 'BANNED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "BalanceStatus" AS ENUM ('ACTIVE', 'PENDING', 'FROZEN', 'INSUFFICIENT', 'CLOSED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'MVOLA', 'ORANGE_MONEY', 'PROMO');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('FINDING_DRIVER', 'CANCELLED', 'DRIVER_ACCEPTED', 'DRIVER_ON_THE_WAY', 'STOPPED', 'DRIVER_ARRIVED', 'CLIENT_NOT_FOUND', 'ON_RIDE', 'CLIENT_GIVE_UP', 'ARRIVED_DESTINATION', 'COMPLETED', 'ADMIN_CHECK');

-- CreateTable
CREATE TABLE "Profile" (
    "sub" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "gender" "GenderType" NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "profilePhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("sub")
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "clientProfileId" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "completeRide" INTEGER NOT NULL DEFAULT 0,
    "cancelledRide" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("clientProfileId")
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "driverProfileId" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "completeRide" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("driverProfileId")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "adminProfileId" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("adminProfileId")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "clientProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'TRANSFERT',
    "driverProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "accountBalanceId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceStatus" "BalanceStatus" NOT NULL DEFAULT 'ACTIVE',
    "clientProfileId" TEXT,
    "driverProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("accountBalanceId")
);

-- CreateTable
CREATE TABLE "RapideBalance" (
    "rapideBalanceId" TEXT NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "ride" DOUBLE PRECISION NOT NULL,
    "food" DOUBLE PRECISION NOT NULL,
    "mart" DOUBLE PRECISION NOT NULL,
    "express" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RapideBalance_pkey" PRIMARY KEY ("rapideBalanceId")
);

-- CreateTable
CREATE TABLE "RideInvoice" (
    "rideInvoiceId" TEXT NOT NULL,
    "clientProfileId" TEXT,
    "driverProfileId" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "vehicleId" TEXT,
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
    "realDuration" DOUBLE PRECISION,
    "realPrice" DOUBLE PRECISION,
    "status" "RideStatus",
    "note" DOUBLE PRECISION,
    "review" TEXT,
    "startTime" DOUBLE PRECISION,
    "endTime" DOUBLE PRECISION,
    "createdAt" TEXT,
    "updatedAt" TEXT,

    CONSTRAINT "RideInvoice_pkey" PRIMARY KEY ("rideInvoiceId")
);

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
    "estimatedPrice" TEXT NOT NULL,
    "realDuration" DOUBLE PRECISION,
    "realPrice" DOUBLE PRECISION,
    "status" "RideStatus",
    "note" DOUBLE PRECISION,
    "review" TEXT,
    "startTime" DOUBLE PRECISION,
    "endTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("rideId")
);

-- CreateTable
CREATE TABLE "Home" (
    "homeId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Home',
    "phoneNumber" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "motoCount" INTEGER NOT NULL DEFAULT 0,
    "carCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Home_pkey" PRIMARY KEY ("homeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_phoneNumber_key" ON "Profile"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_clientProfileId_key" ON "AccountBalance"("clientProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_driverProfileId_key" ON "AccountBalance"("driverProfileId");

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "Profile"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "Profile"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_adminProfileId_fkey" FOREIGN KEY ("adminProfileId") REFERENCES "Profile"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideInvoice" ADD CONSTRAINT "RideInvoice_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideInvoice" ADD CONSTRAINT "RideInvoice_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE SET NULL ON UPDATE CASCADE;
