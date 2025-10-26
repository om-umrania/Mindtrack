/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Made the column `context` on table `Nudge` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Nudge_userId_idx";

-- DropIndex
DROP INDEX "Recommendation_userId_idx";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Nudge" ALTER COLUMN "context" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "Nudge_userId_createdAt_idx" ON "Nudge"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_userId_createdAt_idx" ON "Recommendation"("userId", "createdAt");
