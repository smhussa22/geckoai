/*
  Warnings:

  - A unique constraint covering the columns `[calendarId,googleId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "googleId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_calendarId_googleId_key" ON "public"."Event"("calendarId", "googleId");
