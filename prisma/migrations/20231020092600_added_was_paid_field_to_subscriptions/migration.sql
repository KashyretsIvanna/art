/*
  Warnings:

  - Added the required column `wasPaid` to the `UserSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "wasPaid" BOOLEAN NOT NULL DEFAULT false;

UPDATE "UserSubscription" SET "wasPaid" = true WHERE "planId" = 2;

-- remove default value
ALTER TABLE "UserSubscription" ALTER COLUMN "wasPaid" DROP DEFAULT;
