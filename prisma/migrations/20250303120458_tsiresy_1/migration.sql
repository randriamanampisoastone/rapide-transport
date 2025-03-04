-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('NONE', 'SUPER_ADMIN', 'RIDE_MANAGER', 'DRIVER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE_MANAGER', 'PROMOTION_MANAGER', 'FLEET_MANAGER', 'DISPUTE_MANAGER');

-- CreateEnum
CREATE TYPE "RequestFor" AS ENUM ('RIDE', 'FOOT', 'MART', 'EXPRESS');

-- CreateTable
CREATE TABLE "ClientRequest" (
    "clientRequestId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "requestFor" "RequestFor" NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("clientRequestId")
);

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;
