/*
  Warnings:

  - You are about to drop the column `ctxProfiePhotoId` on the `Notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "ctxProfiePhotoId",
ADD COLUMN     "ctxProfilePhotoId" INTEGER;

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';
