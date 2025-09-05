/*
  Warnings:

  - The values [PRO] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `draftId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Attachment` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Plan_new" AS ENUM ('FREE', 'PLUS');
ALTER TABLE "public"."User" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "plan" TYPE "public"."Plan_new" USING ("plan"::text::"public"."Plan_new");
ALTER TYPE "public"."Plan" RENAME TO "Plan_old";
ALTER TYPE "public"."Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "public"."User" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Attachment" DROP COLUMN "draftId",
DROP COLUMN "expiresAt";
