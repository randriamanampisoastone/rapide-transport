-- DropForeignKey
ALTER TABLE "ClientRequest" DROP CONSTRAINT "ClientRequest_clientProfileId_fkey";

-- AlterTable
ALTER TABLE "ClientRequest" ALTER COLUMN "clientProfileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE SET NULL ON UPDATE CASCADE;
