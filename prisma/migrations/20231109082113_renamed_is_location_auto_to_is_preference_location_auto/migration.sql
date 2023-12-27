/*
  Warnings:

  - You are about to drop the column `isLocationAuto` on the `ProfileSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "ProfileSettings" DROP COLUMN "isLocationAuto",
ADD COLUMN     "isLocationPreferenceAuto" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';
