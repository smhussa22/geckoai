-- CreateEnum
CREATE TYPE "public"."CalendarVisibility" AS ENUM ('DEFAULT', 'PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "public"."Calendar" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "defaultVisibility" "public"."CalendarVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "visibility" "public"."CalendarVisibility" NOT NULL DEFAULT 'DEFAULT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_publicId_key" ON "public"."Calendar"("publicId");

-- CreateIndex
CREATE INDEX "Calendar_ownerId_idx" ON "public"."Calendar"("ownerId");

-- CreateIndex
CREATE INDEX "Event_calendarId_start_idx" ON "public"."Event"("calendarId", "start");

-- AddForeignKey
ALTER TABLE "public"."Calendar" ADD CONSTRAINT "Calendar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
