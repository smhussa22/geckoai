/*
  Warnings:

  - Added the required column `googleId` to the `Calendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Calendar" ADD COLUMN     "googleId" TEXT NOT NULL;
