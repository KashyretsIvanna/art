-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- CreateTable
CREATE TABLE "ResetPasswordCode" (
    "id" SERIAL NOT NULL,
    "verificationCode" VARCHAR(5) NOT NULL,
    "expirationTime" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '15 minutes',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ResetPasswordCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordCode_verificationCode_key" ON "ResetPasswordCode"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordCode_userId_key" ON "ResetPasswordCode"("userId");

-- AddForeignKey
ALTER TABLE "ResetPasswordCode" ADD CONSTRAINT "ResetPasswordCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
