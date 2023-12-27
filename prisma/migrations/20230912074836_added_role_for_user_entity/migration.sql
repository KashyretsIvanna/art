-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
