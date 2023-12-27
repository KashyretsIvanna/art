/*
  Warnings:

  - You are about to drop the column `isAvatar` on the `ProfilePhoto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatarId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `order` on table `ProfilePhoto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "avatarId" INTEGER;

-- AlterTable
ALTER TABLE "ProfilePhoto" DROP COLUMN "isAvatar",
ALTER COLUMN "order" SET NOT NULL;

-- CreateTable
CREATE TABLE "Avatar" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mimetype" VARCHAR(255) NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_name_key" ON "Avatar"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatarId_key" ON "Profile"("avatarId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
