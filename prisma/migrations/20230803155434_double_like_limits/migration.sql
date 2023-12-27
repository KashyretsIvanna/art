-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- CreateTable
CREATE TABLE "DoubleLikeLimits" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "remainingDoubleLikes" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "DoubleLikeLimits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoubleLikeLimits_profileId_key" ON "DoubleLikeLimits"("profileId");

-- AddForeignKey
ALTER TABLE "DoubleLikeLimits" ADD CONSTRAINT "DoubleLikeLimits_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
