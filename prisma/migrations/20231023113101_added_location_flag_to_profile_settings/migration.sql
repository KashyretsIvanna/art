/*
  Warnings:

  - Made the column `ctxProfileId` on table `Notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Notifications" ALTER COLUMN "ctxProfileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProfileSettings" ADD COLUMN     "isLocationAuto" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';
