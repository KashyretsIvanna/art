/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ArtOrientations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ArtOrientations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Classifications` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Classifications` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `GalleryTypes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `GalleryTypes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ArtOrientations" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "Classifications" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "GalleryTypes" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
