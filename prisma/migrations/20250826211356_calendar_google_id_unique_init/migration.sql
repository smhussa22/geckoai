/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,googleId]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Calendar_ownerId_googleId_key" ON "public"."Calendar"("ownerId", "googleId");
