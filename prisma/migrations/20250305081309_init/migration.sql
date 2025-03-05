-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'RIDE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'FOOD_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'MART_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'EXPRESS_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'DRIVER_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'CUSTOMER_SUPPORT';
ALTER TYPE "UserRole" ADD VALUE 'FINANCE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'PROMOTION_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'FLEET_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'DISPUTE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'OPERATIONS_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'PARTNER_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'COMPLIANCE_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'TECH_SUPPORT';

-- DropEnum
DROP TYPE "AdminRole";
