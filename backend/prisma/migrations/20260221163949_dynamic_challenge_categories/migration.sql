/*
  SAFE NON-DESTRUCTIVE MIGRATION
  ==============================

  Problem:
  - Prisma wanted to DROP and recreate columns, which would cause data loss.
  - We must preserve existing enum values and convert them safely to TEXT/TEXT[].

  Strategy:
  1. Rename old columns (keep data safe)
  2. Create new columns with new type
  3. Copy data using explicit cast
  4. Apply NOT NULL constraints after data copy
  5. Drop old enum columns
  6. Drop enum type
  7. Create new ChallengeCategory table
  8. Recreate indexes

  This is the industry-standard expand → migrate → contract pattern.
*/


/*
==================================================
STEP 1 — Challenge table
==================================================
*/

-- 1. Rename old enum column
ALTER TABLE "Challenge"
RENAME COLUMN "category" TO "category_old";

-- 2. Add new TEXT column (nullable temporarily)
ALTER TABLE "Challenge"
ADD COLUMN "category" TEXT;

-- 3. Copy data from enum → text safely
UPDATE "Challenge"
SET "category" = "category_old"::text;

-- 4. Make new column required
ALTER TABLE "Challenge"
ALTER COLUMN "category" SET NOT NULL;

-- 5. Drop old enum column
ALTER TABLE "Challenge"
DROP COLUMN "category_old";


/*
==================================================
STEP 2 — Invitation table
==================================================
*/

ALTER TABLE "Invitation"
RENAME COLUMN "category" TO "category_old";

ALTER TABLE "Invitation"
ADD COLUMN "category" TEXT;

UPDATE "Invitation"
SET "category" = "category_old"::text;

ALTER TABLE "Invitation"
ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "Invitation"
DROP COLUMN "category_old";


/*
==================================================
STEP 3 — Submission table
==================================================
*/

ALTER TABLE "Submission"
RENAME COLUMN "category" TO "category_old";

ALTER TABLE "Submission"
ADD COLUMN "category" TEXT;

UPDATE "Submission"
SET "category" = "category_old"::text;

ALTER TABLE "Submission"
ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "Submission"
DROP COLUMN "category_old";


/*
==================================================
STEP 4 — Cohort allowedCategories
(enum[] → text[])
==================================================
*/

ALTER TABLE "Cohort"
RENAME COLUMN "allowedCategories" TO "allowedCategories_old";

ALTER TABLE "Cohort"
ADD COLUMN "allowedCategories" TEXT[];

-- Cast enum[] → text[]
UPDATE "Cohort"
SET "allowedCategories" =
ARRAY(
  SELECT unnest("allowedCategories_old")::text
);

ALTER TABLE "Cohort"
DROP COLUMN "allowedCategories_old";


/*
==================================================
STEP 5 — Drop enum type
==================================================
*/

DROP TYPE "Category";


/*
==================================================
STEP 6 — Create new dynamic category table
==================================================
*/

CREATE TABLE "ChallengeCategory" (

    "id" TEXT NOT NULL,

    "name" TEXT NOT NULL,

    "isActive" BOOLEAN NOT NULL DEFAULT true,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeCategory_pkey"
    PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX
"ChallengeCategory_name_key"
ON "ChallengeCategory"("name");


CREATE INDEX
"ChallengeCategory_isActive_idx"
ON "ChallengeCategory"("isActive");


/*
==================================================
STEP 7 — Recreate indexes
==================================================
*/

CREATE INDEX
"Challenge_cohortId_category_idx"
ON "Challenge"("cohortId", "category");


CREATE INDEX
"Invitation_cohortId_category_idx"
ON "Invitation"("cohortId", "category");


CREATE INDEX
"Submission_cohortId_category_status_idx"
ON "Submission"("cohortId", "category", "status");