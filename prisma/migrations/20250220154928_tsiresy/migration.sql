-- AlterTable
ALTER TABLE "Home" ADD COLUMN     "carCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "motoCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Home';
