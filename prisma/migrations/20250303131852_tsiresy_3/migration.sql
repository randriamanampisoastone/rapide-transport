/*
  Warnings:

  - Made the column `clientProfileId` on table `ClientRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ClientRequest" DROP CONSTRAINT "ClientRequest_clientProfileId_fkey";

-- AlterTable
ALTER TABLE "ClientRequest" ALTER COLUMN "clientProfileId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("clientProfileId") ON DELETE RESTRICT ON UPDATE CASCADE;
