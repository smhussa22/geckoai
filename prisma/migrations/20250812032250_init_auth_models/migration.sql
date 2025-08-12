/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "public"."Session";

-- CreateTable
CREATE TABLE "public"."GoogleToken" (
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleToken_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."GoogleToken" ADD CONSTRAINT "GoogleToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
