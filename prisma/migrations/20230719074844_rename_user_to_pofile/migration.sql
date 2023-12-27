
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
ALTER TABLE "LikeLimits" DROP CONSTRAINT "LikeLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "RewindLimits" DROP CONSTRAINT "RewindLimits_userId_fkey";

-- DropForeignKey
ALTER TABLE "SuperLikeLimits" DROP CONSTRAINT "SuperLikeLimits_userId_fkey";

-- DropIndex
DROP INDEX "BoostLimits_userId_key";

-- DropIndex
DROP INDEX "FavoriteLimits_userId_key";

-- DropIndex
DROP INDEX "Favorites_userId_favoriteUserId_key";

-- DropIndex
DROP INDEX "LikeLimits_userId_key";

-- DropIndex
DROP INDEX "RewindLimits_userId_key";

-- DropIndex
DROP INDEX "SuperLikeLimits_userId_key";







-- AlterTable
ALTER TABLE "BoostLimits" RENAME COLUMN "userId" TO "profileId";

-- AlterTable
ALTER TABLE "Boosts" RENAME COLUMN "userId" TO "profileId";

-- AlterTable
ALTER TABLE "FavoriteLimits" RENAME COLUMN "userId" TO "profileId";

-- AlterTable
ALTER TABLE "Favorites" RENAME COLUMN "userId" TO "profileId";
ALTER TABLE "Favorites" RENAME COLUMN "favoriteUserId" TO "favoriteProfileId";

-- AlterTable
ALTER TABLE "LikeLimits" RENAME COLUMN "userId" TO "profileId";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "isLookingForGallery" SET NOT NULL,
ALTER COLUMN "isLookingForArtist" SET NOT NULL,
ALTER COLUMN "isLookingForCollector" SET NOT NULL;

-- AlterTable
ALTER TABLE "RewindLimits" RENAME COLUMN "userId" TO "profileId";

-- AlterTable
ALTER TABLE "SuperLikeLimits" RENAME COLUMN "userId" TO "profileId";

-- CreateIndex
CREATE UNIQUE INDEX "BoostLimits_profileId_key" ON "BoostLimits"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteLimits_profileId_key" ON "FavoriteLimits"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorites_profileId_favoriteProfileId_key" ON "Favorites"("profileId", "favoriteProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "LikeLimits_profileId_key" ON "LikeLimits"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "RewindLimits_profileId_key" ON "RewindLimits"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperLikeLimits_profileId_key" ON "SuperLikeLimits"("profileId");

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_favoriteProfileId_fkey" FOREIGN KEY ("favoriteProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikeLimits" ADD CONSTRAINT "SuperLikeLimits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewindLimits" ADD CONSTRAINT "RewindLimits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostLimits" ADD CONSTRAINT "BoostLimits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boosts" ADD CONSTRAINT "Boosts_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLimits" ADD CONSTRAINT "FavoriteLimits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeLimits" ADD CONSTRAINT "LikeLimits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
