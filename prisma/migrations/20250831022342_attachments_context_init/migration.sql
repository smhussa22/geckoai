/*
  Warnings:

  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bucket,s3Key]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `calendarId` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calendarId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AttachmentStatus" AS ENUM ('STAGED', 'ATTACHED', 'DELETED');

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropIndex
DROP INDEX "public"."Attachment_userId_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Message_chatId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "calendarId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "draftId" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."AttachmentStatus" NOT NULL DEFAULT 'STAGED';

-- AlterTable
ALTER TABLE "public"."Calendar" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "chatId",
ADD COLUMN     "calendarId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."Chat";

-- CreateIndex
CREATE INDEX "Attachment_userId_status_createdAt_idx" ON "public"."Attachment"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_calendarId_status_createdAt_idx" ON "public"."Attachment"("calendarId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_messageId_idx" ON "public"."Attachment"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_bucket_s3Key_key" ON "public"."Attachment"("bucket", "s3Key");

-- CreateIndex
CREATE INDEX "Calendar_lastMessageAt_idx" ON "public"."Calendar"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_calendarId_createdAt_idx" ON "public"."Message"("calendarId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
