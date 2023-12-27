/*
  Warnings:

  - You are about to drop the column `url` on the `MessageAttachement` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `ProfilePhoto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "MessageAttachement" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "ProfilePhoto" DROP COLUMN "url";
