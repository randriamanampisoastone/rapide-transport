-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EnterpriseType" AS ENUM ('RETAIL', 'WHOLESALE', 'MARKETPLACE', 'DIGITAL_PRODUCTS', 'ARTISANAL', 'DROPSHIPPING', 'ECO_FRIENDLY', 'LUXURY', 'RESTAURANT', 'FAST_FOOD', 'CAFE', 'FOOD_TRUCK', 'BAKERY', 'PASTRY_SHOP', 'ICE_CREAM', 'OTHER');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'ARCHIVED', 'DEACTIVATED', 'CLOSED', 'UNDER_REVIEW', 'UNVERIFIED', 'BANNED');

-- CreateEnum
CREATE TYPE "VehicleRole" AS ENUM ('RIDE', 'RENT', 'EXPRESS', 'DELIVERY');

-- CreateEnum
CREATE TYPE "PhoneNumberStatus" AS ENUM ('VERIFIED', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILD');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ACCOUNT_BALANCE', 'CASH', 'ORANGE_MONEY', 'MVOLA', 'CREDIT_CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "MobilePamentType" AS ENUM ('MVOLA', 'ORANGE_MONEY');

-- CreateEnum
CREATE TYPE "BalanceStatus" AS ENUM ('ACTIVE', 'PENDING', 'FROZEN', 'INSUFFICIENT', 'CLOSED');

-- CreateTable
CREATE TABLE "ClientProfile" (
    "clientProfileId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "GenderType" NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "profilePhoto" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProfile_pkey" PRIMARY KEY ("clientProfileId")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "providerProfileId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enterpriseName" TEXT NOT NULL,
    "enterpriseType" "EnterpriseType" NOT NULL,
    "enterpriseDescription" TEXT[],
    "enterpriseLogo" TEXT,
    "enterpriseProfilePhoto" TEXT NOT NULL,
    "enterprisePhotos" TEXT[],
    "foodCategory" TEXT[],
    "status" "ProfileStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("providerProfileId")
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "driverProfileId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "GenderType" NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "cinPhotos" TEXT[],
    "permisPhotos" TEXT[],
    "driverProfileMeanRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "driverFeedbackCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ProfileStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("driverProfileId")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "adminProfileId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("adminProfileId")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicleId" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleMarque" TEXT NOT NULL,
    "vehiclePlace" INTEGER NOT NULL,
    "vehicleRegistrationNumber" TEXT,
    "vehiclePhotos" TEXT[],
    "role" "VehicleRole" NOT NULL,
    "driverProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicleId")
);

-- CreateTable
CREATE TABLE "Address" (
    "addressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Antananarivo',
    "country" TEXT NOT NULL DEFAULT 'Madagascar',
    "lot" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "clientProfileId" TEXT,
    "providerProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "scheduleId" TEXT NOT NULL,
    "mondayIsOpen" BOOLEAN NOT NULL,
    "mondayOpenAt" TEXT,
    "mondayCloseAt" TEXT,
    "tuesdayIsOpen" BOOLEAN NOT NULL,
    "tuesdayOpenAt" TEXT,
    "tuesdayCloseAt" TEXT,
    "wendnesdayIsOpen" BOOLEAN NOT NULL,
    "wendnesdayOpenAt" TEXT,
    "wendnesdayCloseAt" TEXT,
    "thursdayIsOpen" BOOLEAN NOT NULL,
    "thursdayOpenAt" TEXT,
    "thursdayCloseAt" TEXT,
    "fridayIsOpen" BOOLEAN NOT NULL,
    "fridayOpenAt" TEXT,
    "fridayCloseAt" TEXT,
    "saturdayIsOpen" BOOLEAN NOT NULL,
    "saturdayOpenAt" TEXT,
    "saturdayCloseAt" TEXT,
    "sundayIsOpen" BOOLEAN NOT NULL,
    "sundayOpenAt" TEXT,
    "sundayCloseAt" TEXT,
    "providerProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("scheduleId")
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "phoneNumberId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "PhoneNumberStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "clientProfileId" TEXT,
    "driverProfileId" TEXT,
    "providerProfileId" TEXT,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("phoneNumberId")
);

-- CreateTable
CREATE TABLE "Food" (
    "foodId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "foodProfilePhoto" TEXT NOT NULL,
    "foodPhotos" TEXT[],
    "foodDescriptions" TEXT[],
    "foodPrice" DOUBLE PRECISION NOT NULL,
    "foodCategory" TEXT NOT NULL,
    "foodOrigin" TEXT NOT NULL DEFAULT 'Malagasy',
    "foodTypes" TEXT[],
    "foodIngredients" TEXT[],
    "foodCalory" DOUBLE PRECISION,
    "foodIsAvailable" BOOLEAN NOT NULL DEFAULT true,
    "foodIsPromotion" BOOLEAN NOT NULL DEFAULT false,
    "foodPromotionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foodMeanRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foodFeedbackCount" INTEGER NOT NULL DEFAULT 0,
    "providerProfileId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("foodId")
);

-- CreateTable
CREATE TABLE "FoodSupplement" (
    "foodSupplementId" TEXT NOT NULL,
    "foodSupplementTitle" TEXT NOT NULL,
    "foodSupplementMaxChoice" INTEGER NOT NULL,
    "foodId" TEXT,

    CONSTRAINT "FoodSupplement_pkey" PRIMARY KEY ("foodSupplementId")
);

-- CreateTable
CREATE TABLE "FoodSupplementItem" (
    "foodSupplementItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "foodSupplementId" TEXT,

    CONSTRAINT "FoodSupplementItem_pkey" PRIMARY KEY ("foodSupplementItemId")
);

-- CreateTable
CREATE TABLE "Mart" (
    "martId" TEXT NOT NULL,
    "martName" TEXT NOT NULL,
    "martProfilePhoto" TEXT NOT NULL,
    "martPhotos" TEXT[],
    "martCategory" TEXT NOT NULL,
    "martType" TEXT[],
    "martGuaranty" TEXT NOT NULL,
    "martPrice" DOUBLE PRECISION NOT NULL,
    "martIsAvailable" BOOLEAN NOT NULL DEFAULT true,
    "martIsPromotion" BOOLEAN NOT NULL DEFAULT false,
    "martPromotionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "martMeanRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "martFeedbackCount" INTEGER NOT NULL DEFAULT 0,
    "providerProfileId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mart_pkey" PRIMARY KEY ("martId")
);

-- CreateTable
CREATE TABLE "MartItem" (
    "martItemId" TEXT NOT NULL,
    "martItemName" TEXT NOT NULL,
    "martItemValues" TEXT[],
    "martId" TEXT NOT NULL,

    CONSTRAINT "MartItem_pkey" PRIMARY KEY ("martItemId")
);

-- CreateTable
CREATE TABLE "FoodInvoice" (
    "foodInvoiceId" TEXT NOT NULL,
    "subTotalInvoice" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "deliveryPrice" DOUBLE PRECISION NOT NULL,
    "totalInvoice" DOUBLE PRECISION NOT NULL,
    "deliveryDistance" DOUBLE PRECISION NOT NULL,
    "deliveryAddress" TEXT,
    "deliveryCity" TEXT NOT NULL,
    "deliveryZipCode" TEXT,
    "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "clientProfileId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodInvoice_pkey" PRIMARY KEY ("foodInvoiceId")
);

-- CreateTable
CREATE TABLE "FoodOnInvoice" (
    "foodOnInvoiceId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "foodPriceAtOrder" DOUBLE PRECISION NOT NULL,
    "foodCategory" TEXT NOT NULL,
    "foodOrigin" TEXT NOT NULL,
    "foodTypes" TEXT[],
    "foodQuantity" INTEGER NOT NULL DEFAULT 1,
    "foodInvoiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodOnInvoice_pkey" PRIMARY KEY ("foodOnInvoiceId")
);

-- CreateTable
CREATE TABLE "FoodCart" (
    "foodCartId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodCart_pkey" PRIMARY KEY ("foodCartId")
);

-- CreateTable
CREATE TABLE "FoodOnCart" (
    "foodOnCartId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "foodId" TEXT NOT NULL,
    "foodCartId" TEXT NOT NULL,

    CONSTRAINT "FoodOnCart_pkey" PRIMARY KEY ("foodOnCartId")
);

-- CreateTable
CREATE TABLE "MartInvoice" (
    "martInvoiceId" TEXT NOT NULL,
    "subTotalInvoice" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "deliveryPrice" DOUBLE PRECISION NOT NULL,
    "totalInvoice" DOUBLE PRECISION NOT NULL,
    "deliveryDistance" DOUBLE PRECISION NOT NULL,
    "deliveryAddress" TEXT,
    "deliveryCity" TEXT NOT NULL,
    "deliveryZipCode" TEXT,
    "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "clientProfileId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MartInvoice_pkey" PRIMARY KEY ("martInvoiceId")
);

-- CreateTable
CREATE TABLE "MartOnInvoice" (
    "id" TEXT NOT NULL,
    "martId" TEXT NOT NULL,
    "martName" TEXT NOT NULL,
    "martPriceAtOrder" DOUBLE PRECISION NOT NULL,
    "martCategory" TEXT NOT NULL,
    "martOrigin" TEXT NOT NULL,
    "martTypes" TEXT[],
    "martQuantity" INTEGER NOT NULL DEFAULT 1,
    "martItemsName" TEXT[],
    "martItemsValue" TEXT[],
    "martInvoiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MartOnInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MartCart" (
    "martCartId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MartCart_pkey" PRIMARY KEY ("martCartId")
);

-- CreateTable
CREATE TABLE "MartOnCart" (
    "martOnCartId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "martId" TEXT NOT NULL,
    "martCartId" TEXT NOT NULL,

    CONSTRAINT "MartOnCart_pkey" PRIMARY KEY ("martOnCartId")
);

-- CreateTable
CREATE TABLE "FeedBack" (
    "feedBackId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "appreciates" TEXT[],
    "noAppreciates" TEXT[],
    "clientProfileId" TEXT NOT NULL,
    "foodId" TEXT,
    "martId" TEXT,
    "driverProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedBack_pkey" PRIMARY KEY ("feedBackId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "foodIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "martIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rideIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rentIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expressIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapideIncomeForFood" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapideIncomeForMart" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapideIncomeForDelivery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapideIncomeForRide" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapideIncomeForRent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rapideIncomeForExpress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "foodInvoiceId" TEXT,
    "martInvoiceId" TEXT,
    "rapideBalanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "MobilePaymentAccount" (
    "mobilePaymentAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MobilePamentType" NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isValidate" BOOLEAN NOT NULL DEFAULT false,
    "clientProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobilePaymentAccount_pkey" PRIMARY KEY ("mobilePaymentAccountId")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "accountBalanceId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceStatus" "BalanceStatus" NOT NULL DEFAULT 'PENDING',
    "clientProfileId" TEXT,
    "driverProfileId" TEXT,
    "providerProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("accountBalanceId")
);

-- CreateTable
CREATE TABLE "RapideBalance" (
    "rapideBalanceId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RapideBalance_pkey" PRIMARY KEY ("rapideBalanceId")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "favoriteId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("favoriteId")
);

-- CreateTable
CREATE TABLE "FoodOnFavorite" (
    "foodOnFavoriteId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "favoriteId" TEXT,

    CONSTRAINT "FoodOnFavorite_pkey" PRIMARY KEY ("foodOnFavoriteId")
);

-- CreateTable
CREATE TABLE "MartOnFavorite" (
    "martOnFavoriteId" TEXT NOT NULL,
    "martId" TEXT NOT NULL,
    "favoriteId" TEXT,

    CONSTRAINT "MartOnFavorite_pkey" PRIMARY KEY ("martOnFavoriteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_email_key" ON "ClientProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_email_key" ON "ProviderProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_email_key" ON "DriverProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_email_key" ON "AdminProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleRegistrationNumber_key" ON "Vehicle"("vehicleRegistrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_driverProfileId_key" ON "Vehicle"("driverProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_providerProfileId_key" ON "Schedule"("providerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_phoneNumber_key" ON "PhoneNumber"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_clientProfileId_key" ON "PhoneNumber"("clientProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_driverProfileId_key" ON "PhoneNumber"("driverProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCart_clientProfileId_key" ON "FoodCart"("clientProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "MartCart_clientProfileId_key" ON "MartCart"("clientProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_foodInvoiceId_key" ON "Payment"("foodInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_martInvoiceId_key" ON "Payment"("martInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_rapideBalanceId_key" ON "Payment"("rapideBalanceId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_clientProfileId_key" ON "AccountBalance"("clientProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_driverProfileId_key" ON "AccountBalance"("driverProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_providerProfileId_key" ON "AccountBalance"("providerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_clientProfileId_key" ON "Favorite"("clientProfileId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("providerProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("providerProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("providerProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("providerProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodSupplement" ADD CONSTRAINT "FoodSupplement_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("foodId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodSupplementItem" ADD CONSTRAINT "FoodSupplementItem_foodSupplementId_fkey" FOREIGN KEY ("foodSupplementId") REFERENCES "FoodSupplement"("foodSupplementId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mart" ADD CONSTRAINT "Mart_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("providerProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartItem" ADD CONSTRAINT "MartItem_martId_fkey" FOREIGN KEY ("martId") REFERENCES "Mart"("martId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodInvoice" ADD CONSTRAINT "FoodInvoice_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOnInvoice" ADD CONSTRAINT "FoodOnInvoice_foodInvoiceId_fkey" FOREIGN KEY ("foodInvoiceId") REFERENCES "FoodInvoice"("foodInvoiceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodCart" ADD CONSTRAINT "FoodCart_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOnCart" ADD CONSTRAINT "FoodOnCart_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("foodId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOnCart" ADD CONSTRAINT "FoodOnCart_foodCartId_fkey" FOREIGN KEY ("foodCartId") REFERENCES "FoodCart"("foodCartId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartInvoice" ADD CONSTRAINT "MartInvoice_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartOnInvoice" ADD CONSTRAINT "MartOnInvoice_martInvoiceId_fkey" FOREIGN KEY ("martInvoiceId") REFERENCES "MartInvoice"("martInvoiceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartCart" ADD CONSTRAINT "MartCart_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartOnCart" ADD CONSTRAINT "MartOnCart_martId_fkey" FOREIGN KEY ("martId") REFERENCES "Mart"("martId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartOnCart" ADD CONSTRAINT "MartOnCart_martCartId_fkey" FOREIGN KEY ("martCartId") REFERENCES "MartCart"("martCartId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("foodId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_martId_fkey" FOREIGN KEY ("martId") REFERENCES "Mart"("martId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_foodInvoiceId_fkey" FOREIGN KEY ("foodInvoiceId") REFERENCES "FoodInvoice"("foodInvoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_martInvoiceId_fkey" FOREIGN KEY ("martInvoiceId") REFERENCES "MartInvoice"("martInvoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rapideBalanceId_fkey" FOREIGN KEY ("rapideBalanceId") REFERENCES "RapideBalance"("rapideBalanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobilePaymentAccount" ADD CONSTRAINT "MobilePaymentAccount_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "DriverProfile"("driverProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("providerProfileId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOnFavorite" ADD CONSTRAINT "FoodOnFavorite_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("foodId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodOnFavorite" ADD CONSTRAINT "FoodOnFavorite_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Favorite"("favoriteId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartOnFavorite" ADD CONSTRAINT "MartOnFavorite_martId_fkey" FOREIGN KEY ("martId") REFERENCES "Mart"("martId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MartOnFavorite" ADD CONSTRAINT "MartOnFavorite_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Favorite"("favoriteId") ON DELETE CASCADE ON UPDATE CASCADE;
