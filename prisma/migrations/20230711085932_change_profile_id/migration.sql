-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- Drop prev constraint
ALTER TABLE "ProfileArtOrientations" DROP CONSTRAINT "ProfileArtOrientations_userId_fkey";
ALTER TABLE "ProfileClassifications" DROP CONSTRAINT "ProfileClassifications_userId_fkey";
ALTER TABLE "ProfileGalleryTypes" DROP CONSTRAINT "ProfileGalleryTypes_userId_fkey";

-- Change column name
ALTER TABLE "ProfileArtOrientations" ADD "profileId" INT;
update "ProfileArtOrientations"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;

ALTER TABLE "ProfileClassifications" ADD "profileId" INT;
update "ProfileClassifications"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;

ALTER TABLE "ProfileGalleryTypes" ADD "profileId" INT;
update "ProfileGalleryTypes"
  set "profileId" = case when "userId" IS NOT NULL then "userId" else NULL end;


-- AddForeignKey
ALTER TABLE "ProfileClassifications" ADD CONSTRAINT "ProfileClassifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGalleryTypes" ADD CONSTRAINT "ProfileGalleryTypes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileArtOrientations" ADD CONSTRAINT "ProfileArtOrientations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProfileClassifications" DROP COLUMN "userId";
ALTER TABLE "ProfileGalleryTypes" DROP COLUMN "userId";
ALTER TABLE "ProfileArtOrientations" DROP COLUMN "userId";

ALTER TABLE "ProfileClassifications"
ALTER COLUMN "profileId" SET NOT NULL;


ALTER TABLE "ProfileGalleryTypes"
ALTER COLUMN "profileId" SET NOT NULL;


ALTER TABLE "ProfileArtOrientations"
ALTER COLUMN "profileId" SET NOT NULL;


