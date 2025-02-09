/*
  Warnings:

  - You are about to drop the column `balance` on the `RapideBalance` table. All the data in the column will be lost.
  - Added the required column `express` to the `RapideBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `food` to the `RapideBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mart` to the `RapideBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rent` to the `RapideBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ride` to the `RapideBalance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RapideBalance" DROP COLUMN "balance",
ADD COLUMN     "express" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "food" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mart" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ride" DOUBLE PRECISION NOT NULL;
