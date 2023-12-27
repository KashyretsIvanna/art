-- AlterTable
ALTER TABLE "ApplicationSettings" ADD COLUMN     "classificationsLimits" INTEGER,
ADD COLUMN     "classificationsPremiumLimits" INTEGER;

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';
