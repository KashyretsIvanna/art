-- DropForeignKey
ALTER TABLE "Favorites" DROP CONSTRAINT "Favorites_favoriteUserId_fkey";

-- DropForeignKey
ALTER TABLE "Favorites" DROP CONSTRAINT "Favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_likedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfilePhoto" DROP CONSTRAINT "ProfilePhoto_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Rewinds" DROP CONSTRAINT "Rewinds_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Rewinds" DROP CONSTRAINT "Rewinds_rewoundProfileId_fkey";

-- DropForeignKey
ALTER TABLE "SuperLikes" DROP CONSTRAINT "SuperLikes_profileId_fkey";

-- DropForeignKey
ALTER TABLE "SuperLikes" DROP CONSTRAINT "SuperLikes_superLikedProfileId_fkey";

-- DropForeignKey
ALTER TABLE "UnLikes" DROP CONSTRAINT "UnLikes_unLikedUserId_fkey";

-- DropForeignKey
ALTER TABLE "UnLikes" DROP CONSTRAINT "UnLikes_userId_fkey";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_unLikedUserId_fkey" FOREIGN KEY ("unLikedUserId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedUserId_fkey" FOREIGN KEY ("likedUserId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_favoriteUserId_fkey" FOREIGN KEY ("favoriteUserId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewinds" ADD CONSTRAINT "Rewinds_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewinds" ADD CONSTRAINT "Rewinds_rewoundProfileId_fkey" FOREIGN KEY ("rewoundProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikes" ADD CONSTRAINT "SuperLikes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikes" ADD CONSTRAINT "SuperLikes_superLikedProfileId_fkey" FOREIGN KEY ("superLikedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePhoto" ADD CONSTRAINT "ProfilePhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
