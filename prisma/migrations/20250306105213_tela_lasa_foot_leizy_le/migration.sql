/*
  Warnings:

  - The values [FOOT] on the enum `RequestFor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestFor_new" AS ENUM ('RIDE', 'FOOD', 'MART', 'EXPRESS');
ALTER TABLE "ClientRequest" ALTER COLUMN "requestFor" TYPE "RequestFor_new" USING ("requestFor"::text::"RequestFor_new");
ALTER TYPE "RequestFor" RENAME TO "RequestFor_old";
ALTER TYPE "RequestFor_new" RENAME TO "RequestFor";
DROP TYPE "RequestFor_old";
COMMIT;
