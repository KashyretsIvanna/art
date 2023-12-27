/*
  Warnings:

  - You are about to drop the `ProfilePhotos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProfilePhotos" DROP CONSTRAINT "ProfilePhotos_userId_fkey";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "profileId" INTEGER;

-- DropTable
DROP TABLE "ProfilePhotos";

-- CreateIndex
CREATE UNIQUE INDEX "File_profileId_key" ON "File"("profileId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
