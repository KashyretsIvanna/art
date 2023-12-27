/*
  Warnings:

  - You are about to drop the column `verificationCode` on the `ResetPasswordCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resetPasswordCode]` on the table `ResetPasswordCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resetPasswordCode` to the `ResetPasswordCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ResetPasswordCode_verificationCode_key";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "ResetPasswordCode" DROP COLUMN "verificationCode",
ADD COLUMN     "resetPasswordCode" VARCHAR(5) NOT NULL,
ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordCode_resetPasswordCode_key" ON "ResetPasswordCode"("resetPasswordCode");
