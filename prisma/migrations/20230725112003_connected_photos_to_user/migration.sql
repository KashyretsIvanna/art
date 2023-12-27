BEGIN;

-- DropForeignKey
ALTER TABLE
  "ProfilePhoto" DROP CONSTRAINT "ProfilePhoto_profileId_fkey";

DROP INDEX "ProfilePhoto_name_key";

-- AlterTable
ALTER TABLE
  "Boosts"
ALTER COLUMN
  "endTime"
SET
  DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE
  "EmailVerificationCode"
ALTER COLUMN
  "expirationTime"
SET
  DEFAULT NOW() + interval '15 minutes';

-- DropTable
ALTER TABLE
  "ProfilePhoto" RENAME TO "UserPhoto";

ALTER TABLE
  "UserPhoto"
ADD
  COLUMN "userId" INT;

-- Connected photos to User
UPDATE
  "UserPhoto" up
SET
  "userId" = (
    SELECT
      "userId"
    FROM
      "Profile" p
    WHERE
      up."profileId" = p."id"
    LIMIT
      1
  );

ALTER TABLE
  "UserPhoto" DROP COLUMN "profileId";

-- AddForeignKey
ALTER TABLE
  "UserPhoto"
ADD
  CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE
  "UserPhoto" RENAME CONSTRAINT "ProfilePhoto_pkey" TO "UserPhoto_pkey";

CREATE UNIQUE INDEX "UserPhoto_name_key" ON "UserPhoto"("name");

COMMIT;