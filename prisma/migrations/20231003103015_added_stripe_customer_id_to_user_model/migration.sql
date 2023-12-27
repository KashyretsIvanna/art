/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" VARCHAR(255);

-- AlterTable
ALTER TABLE "UserSubscription" RENAME CONSTRAINT "ProfileSubscription_pkey" TO "UserSubscription_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- RenameForeignKey
ALTER TABLE "UserSubscription" RENAME CONSTRAINT "ProfileSubscription_planId_fkey" TO "UserSubscription_planId_fkey";

-- RenameForeignKey
ALTER TABLE "UserSubscription" RENAME CONSTRAINT "ProfileSubscription_userId_fkey" TO "UserSubscription_userId_fkey";

-- RenameIndex
ALTER INDEX "ProfileSubscription_userId_key" RENAME TO "UserSubscription_userId_key";
