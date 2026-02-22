/*
  Warnings:

  - You are about to drop the column `deploymentUrl` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `figmaUrl` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `Submission` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('RECOMMEND', 'NEUTRAL', 'DO_NOT_RECOMMEND');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "criteriaScores" JSONB,
ADD COLUMN     "recommendation" "Recommendation";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "deploymentUrl",
DROP COLUMN "figmaUrl",
DROP COLUMN "githubUrl",
ADD COLUMN     "assignedReviewerId" TEXT,
ADD COLUMN     "designLinks" TEXT,
ADD COLUMN     "liveLink" TEXT,
ADD COLUMN     "repoUrl" TEXT;

-- CreateIndex
CREATE INDEX "Submission_assignedReviewerId_idx" ON "Submission"("assignedReviewerId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignedReviewerId_fkey" FOREIGN KEY ("assignedReviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
