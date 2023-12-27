/*
  Warnings:

  - You are about to drop the column `read` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notifications` table. All the data in the column will be lost.
  - Added the required column `profileId` to the `Notifications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `notificationType` on the `Notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'FAVORITE', 'MATCH', 'LIMIT_RENEW', 'NEW_MESSAGE', 'CHAT_DELETED');

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "read",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileId" INTEGER NOT NULL,
DROP COLUMN "notificationType",
ADD COLUMN     "notificationType" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "ResetPasswordCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
