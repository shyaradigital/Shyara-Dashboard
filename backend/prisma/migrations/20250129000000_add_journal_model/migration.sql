-- CreateEnum
CREATE TYPE "JournalType" AS ENUM ('TASK', 'NOTE');

-- CreateTable
CREATE TABLE "journals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "JournalType" NOT NULL,
    "deadline" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journals_type_idx" ON "journals"("type");

-- CreateIndex
CREATE INDEX "journals_isCompleted_idx" ON "journals"("isCompleted");

-- CreateIndex
CREATE INDEX "journals_deadline_idx" ON "journals"("deadline");

-- CreateIndex
CREATE INDEX "journals_createdById_idx" ON "journals"("createdById");

-- CreateIndex
CREATE INDEX "journals_assignedToId_idx" ON "journals"("assignedToId");

-- CreateIndex
CREATE INDEX "journals_createdAt_idx" ON "journals"("createdAt");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

