/*
  Warnings:

  - Added the required column `for` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryFor" AS ENUM ('MART', 'FOOD');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "for" "CategoryFor" NOT NULL;
