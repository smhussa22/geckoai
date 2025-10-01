-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "due" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_calendarId_due_idx" ON "public"."Task"("calendarId", "due");

-- CreateIndex
CREATE UNIQUE INDEX "Task_calendarId_googleId_key" ON "public"."Task"("calendarId", "googleId");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
