-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Notifications" ALTER COLUMN "ctxProfileName" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';
