/*
  Warnings:

  - You are about to drop the column `isActive` on the `ProfileSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `ProfileSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `ProfileSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ProfileSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProfileSubscription" DROP CONSTRAINT "ProfileSubscription_profileId_fkey";

-- DropIndex
DROP INDEX "ProfileSubscription_planId_profileId_key";

DELETE FROM "ProfileSubscription" WHERE "isActive" IS false;

-- AlterTable
ALTER TABLE "ProfileSubscription" DROP COLUMN "isActive",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProfileSubscription" ADD CONSTRAINT "ProfileSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "ProfileSubscription" SET "userId" = (SELECT "User"."id" FROM "User" INNER JOIN "Profile" ON "Profile"."userId" = "User"."id" WHERE "Profile"."id" = "ProfileSubscription"."profileId");

CREATE UNIQUE INDEX "ProfileSubscription_userId_key" ON "ProfileSubscription"("userId");

ALTER TABLE "ProfileSubscription" ALTER COLUMN "userId" SET NOT NULL;

-- DropColumn
ALTER TABLE "ProfileSubscription" DROP COLUMN "profileId";
