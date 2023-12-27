/*
  Warnings:

  - You are about to drop the column `registrationToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "registrationToken" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "registrationToken";
