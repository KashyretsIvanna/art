-- CreateEnum
CREATE TYPE "StripeSubscriptionStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- CreateTable
CREATE TABLE "StripeSubscription" (
    "id" SERIAL NOT NULL,
    "stripeSubscriptionId" VARCHAR(255) NOT NULL,
    "status" "StripeSubscriptionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "StripeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeSubscription_stripeSubscriptionId_key" ON "StripeSubscription"("stripeSubscriptionId");
