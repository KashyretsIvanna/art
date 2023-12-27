-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" SERIAL NOT NULL,
    "stripeEventId" VARCHAR(255) NOT NULL,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeEvent_stripeEventId_key" ON "StripeEvent"("stripeEventId");
