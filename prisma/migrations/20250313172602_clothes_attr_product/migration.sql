-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colors" TEXT,
ADD COLUMN     "isClothes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sizes" TEXT;
