
-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_likedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "UnLikes" DROP CONSTRAINT "UnLikes_unLikedUserId_fkey";

-- DropForeignKey
ALTER TABLE "UnLikes" DROP CONSTRAINT "UnLikes_userId_fkey";

-- DropIndex
DROP INDEX "Likes_userId_likedUserId_key";

-- DropIndex
DROP INDEX "UnLikes_unLikedUserId_userId_key";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable

ALTER TABLE "Likes" ADD "likedProfileId" INT;
update "Likes"
  set "likedProfileId" = case when "likedUserId" IS NOT NULL then "likedUserId" else NULL end;

  ALTER TABLE "Likes" ADD "profileId" INT;
update "Likes"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;

ALTER TABLE "Likes" DROP COLUMN "likedUserId";
ALTER TABLE "Likes" DROP COLUMN "userId";

-- AlterTable

ALTER TABLE "UnLikes" ADD "unLikedProfileId" INT;
update "UnLikes"
  set "unLikedProfileId" = case when "unLikedUserId" IS NOT NULL then "unLikedUserId" else NULL end;

  ALTER TABLE "UnLikes" ADD "profileId" INT;
update "UnLikes"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;

ALTER TABLE "UnLikes" DROP COLUMN "unLikedUserId";
ALTER TABLE "UnLikes" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Likes_profileId_likedProfileId_key" ON "Likes"("profileId", "likedProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "UnLikes_unLikedProfileId_profileId_key" ON "UnLikes"("unLikedProfileId", "profileId");

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_unLikedProfileId_fkey" FOREIGN KEY ("unLikedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedProfileId_fkey" FOREIGN KEY ("likedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
