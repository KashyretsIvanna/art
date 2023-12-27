/*
  Warnings:

  - Made the column `likedProfileId` on table `Likes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profileId` on table `Likes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unLikedProfileId` on table `UnLikes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profileId` on table `UnLikes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProfileSettings" DROP CONSTRAINT "ProfileSettings_profileId_fkey";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Likes" ALTER COLUMN "likedProfileId" SET NOT NULL,
ALTER COLUMN "profileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UnLikes" ALTER COLUMN "unLikedProfileId" SET NOT NULL,
ALTER COLUMN "profileId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProfileSettings" ADD CONSTRAINT "ProfileSettings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
