-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';


-- DropForeignKey
ALTER TABLE "ArtistClassificationFilter" DROP CONSTRAINT "ArtistClassificationFilter_userId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryClassificationFilter" DROP CONSTRAINT "GalleryClassificationFilter_userId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryTypeFilter" DROP CONSTRAINT "GalleryTypeFilter_userId_fkey";

-- DropForeignKey
ALTER TABLE "Orientation" DROP CONSTRAINT "Orientation_userId_fkey";

-- DropIndex
DROP INDEX "ArtistClassificationFilter_userId_classificationId_key";

-- DropIndex
DROP INDEX "GalleryClassificationFilter_userId_classificationId_key";

-- DropIndex
DROP INDEX "GalleryTypeFilter_userId_galleryTypeId_key";

-- DropIndex
DROP INDEX "Orientation_userId_artOrientationsId_key";

-- Change column name
ALTER TABLE "Orientation" ADD "profileId" INT;
update "Orientation"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;

ALTER TABLE "ArtistClassificationFilter" ADD "profileId" INT; 
update "ArtistClassificationFilter"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;

  ALTER TABLE "GalleryClassificationFilter" ADD "profileId" INT;
update "GalleryClassificationFilter"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;


ALTER TABLE "GalleryTypeFilter" ADD "profileId" INT;
update "GalleryTypeFilter"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;


-- AddForeignKey
ALTER TABLE "ArtistClassificationFilter" ADD CONSTRAINT "ArtistClassificationFilter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryClassificationFilter" ADD CONSTRAINT "GalleryClassificationFilter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryTypeFilter" ADD CONSTRAINT "GalleryTypeFilter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orientation" ADD CONSTRAINT "Orientation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateIndex
CREATE UNIQUE INDEX "ArtistClassificationFilter_profileId_classificationId_key" ON "ArtistClassificationFilter"("profileId", "classificationId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryClassificationFilter_profileId_classificationId_key" ON "GalleryClassificationFilter"("profileId", "classificationId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTypeFilter_profileId_galleryTypeId_key" ON "GalleryTypeFilter"("profileId", "galleryTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Orientation_profileId_artOrientationsId_key" ON "Orientation"("profileId", "artOrientationsId");

ALTER TABLE "ArtistClassificationFilter" DROP COLUMN "userId";
ALTER TABLE "GalleryClassificationFilter" DROP COLUMN "userId";
ALTER TABLE "GalleryTypeFilter" DROP COLUMN "userId";
ALTER TABLE "Orientation" DROP COLUMN "userId";

ALTER TABLE "ArtistClassificationFilter"
ALTER COLUMN "profileId" SET NOT NULL;


ALTER TABLE "GalleryClassificationFilter"
ALTER COLUMN "profileId" SET NOT NULL;


ALTER TABLE "GalleryTypeFilter"
ALTER COLUMN "profileId" SET NOT NULL;


ALTER TABLE "Orientation"
ALTER COLUMN "profileId" SET NOT NULL;



