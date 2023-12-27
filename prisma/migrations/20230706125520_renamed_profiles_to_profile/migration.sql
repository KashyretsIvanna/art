/*
  Warnings:

  - You are about to drop the `Profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArtistClassificationFilter" DROP CONSTRAINT "ArtistClassificationFilter_userId_fkey";

-- DropForeignKey
ALTER TABLE "BoostLimits" DROP CONSTRAINT "BoostLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "Boosts" DROP CONSTRAINT "Boosts_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteLimits" DROP CONSTRAINT "FavoriteLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "Favorites" DROP CONSTRAINT "Favorites_favoriteUserId_fkey";

-- DropForeignKey
ALTER TABLE "Favorites" DROP CONSTRAINT "Favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_profileId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryClassificationFilter" DROP CONSTRAINT "GalleryClassificationFilter_userId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryTypeFilter" DROP CONSTRAINT "GalleryTypeFilter_userId_fkey";

-- DropForeignKey
ALTER TABLE "LikeLimits" DROP CONSTRAINT "LikeLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_likedUserId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "Orientation" DROP CONSTRAINT "Orientation_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileArtOrientations" DROP CONSTRAINT "ProfileArtOrientations_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileClassifications" DROP CONSTRAINT "ProfileClassifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileGalleryTypes" DROP CONSTRAINT "ProfileGalleryTypes_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileSettings" DROP CONSTRAINT "ProfileSettings_profileId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileSubscription" DROP CONSTRAINT "ProfileSubscription_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Profiles" DROP CONSTRAINT "Profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "RewindLimits" DROP CONSTRAINT "RewindLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "Rewinds" DROP CONSTRAINT "Rewinds_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Rewinds" DROP CONSTRAINT "Rewinds_rewoundProfileId_fkey";

-- DropForeignKey
ALTER TABLE "SuperLikeLimits" DROP CONSTRAINT "SuperLikeLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "SuperLikes" DROP CONSTRAINT "SuperLikes_profileId_fkey";

-- DropForeignKey
ALTER TABLE "SuperLikes" DROP CONSTRAINT "SuperLikes_superLikedProfileId_fkey";

-- DropForeignKey
ALTER TABLE "TopPicksLimit" DROP CONSTRAINT "TopPicksLimit_profileId_fkey";

-- DropForeignKey
ALTER TABLE "UnLikes" DROP CONSTRAINT "UnLikes_unLikedUserId_fkey";

-- DropForeignKey
ALTER TABLE "UnLikes" DROP CONSTRAINT "UnLikes_userId_fkey";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

ALTER TABLE IF EXISTS "Profiles" RENAME TO "Profile";

ALTER TABLE "Profile" RENAME CONSTRAINT "Profiles_pkey" TO "Profile_pkey";

-- -- DropTable
-- DROP TABLE "Profiles";

-- -- CreateTable
-- CREATE TABLE "Profile" (
--     "id" SERIAL NOT NULL,
--     "userId" INTEGER NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(3) NOT NULL,
--     "age" INTEGER,
--     "gender" "GenderType",
--     "birthdate" TIMESTAMP(3),
--     "aboutMe" TEXT,
--     "country" VARCHAR(50),
--     "city" VARCHAR(50),
--     "role" "UserRole" NOT NULL,
--     "galleryName" VARCHAR(40),
--     "profileDescription" TEXT,
--     "autoLocation" BOOLEAN NOT NULL DEFAULT true,
--     "manualLocationCountry" VARCHAR(50),
--     "manualCity" VARCHAR(50),
--     "isLookingForGallery" BOOLEAN DEFAULT false,
--     "isLookingForArtist" BOOLEAN DEFAULT false,
--     "isLookingForCollector" BOOLEAN DEFAULT false,

--     CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
-- );

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "ProfileSettings" ADD CONSTRAINT "ProfileSettings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSubscription" ADD CONSTRAINT "ProfileSubscription_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_unLikedUserId_fkey" FOREIGN KEY ("unLikedUserId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedUserId_fkey" FOREIGN KEY ("likedUserId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_favoriteUserId_fkey" FOREIGN KEY ("favoriteUserId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewinds" ADD CONSTRAINT "Rewinds_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewinds" ADD CONSTRAINT "Rewinds_rewoundProfileId_fkey" FOREIGN KEY ("rewoundProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikeLimits" ADD CONSTRAINT "SuperLikeLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikes" ADD CONSTRAINT "SuperLikes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikes" ADD CONSTRAINT "SuperLikes_superLikedProfileId_fkey" FOREIGN KEY ("superLikedProfileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewindLimits" ADD CONSTRAINT "RewindLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostLimits" ADD CONSTRAINT "BoostLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boosts" ADD CONSTRAINT "Boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLimits" ADD CONSTRAINT "FavoriteLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClassifications" ADD CONSTRAINT "ProfileClassifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGalleryTypes" ADD CONSTRAINT "ProfileGalleryTypes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileArtOrientations" ADD CONSTRAINT "ProfileArtOrientations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeLimits" ADD CONSTRAINT "LikeLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopPicksLimit" ADD CONSTRAINT "TopPicksLimit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryClassificationFilter" ADD CONSTRAINT "GalleryClassificationFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistClassificationFilter" ADD CONSTRAINT "ArtistClassificationFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryTypeFilter" ADD CONSTRAINT "GalleryTypeFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orientation" ADD CONSTRAINT "Orientation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
