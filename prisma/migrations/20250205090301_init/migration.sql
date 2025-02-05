-- DropForeignKey
ALTER TABLE "AdminProfile" DROP CONSTRAINT "AdminProfile_adminProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ClientProfile" DROP CONSTRAINT "ClientProfile_clientProfileId_fkey";

-- DropForeignKey
ALTER TABLE "DriverProfile" DROP CONSTRAINT "DriverProfile_driverProfileId_fkey";

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "Profile"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "Profile"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_adminProfileId_fkey" FOREIGN KEY ("adminProfileId") REFERENCES "Profile"("sub") ON DELETE CASCADE ON UPDATE CASCADE;
