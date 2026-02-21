/*
  Warnings:

  - The `allowedCategories` column on the `Cohort` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `Challenge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `Invitation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Cohort" DROP COLUMN "allowedCategories",
ADD COLUMN     "allowedCategories" TEXT[];

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Category";

-- CreateTable
CREATE TABLE "ChallengeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeCategory_name_key" ON "ChallengeCategory"("name");

-- CreateIndex
CREATE INDEX "ChallengeCategory_isActive_idx" ON "ChallengeCategory"("isActive");

-- CreateIndex
CREATE INDEX "Challenge_cohortId_category_idx" ON "Challenge"("cohortId", "category");

-- CreateIndex
CREATE INDEX "Invitation_cohortId_category_idx" ON "Invitation"("cohortId", "category");

-- CreateIndex
CREATE INDEX "Submission_cohortId_category_status_idx" ON "Submission"("cohortId", "category", "status");
