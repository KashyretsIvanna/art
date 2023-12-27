/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_attachmentId_fkey";

-- AlterTable
ALTER TABLE "Boosts" ALTER COLUMN "endTime" SET DEFAULT NOW() + interval '30 minutes';

-- AlterTable
ALTER TABLE "EmailVerificationCode" ALTER COLUMN "expirationTime" SET DEFAULT NOW() + interval '15 minutes';

-- DropTable
DROP TABLE "File";

-- CreateTable
CREATE TABLE "ProfilePhoto" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mimetype" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "isAvatar" BOOLEAN NOT NULL DEFAULT false,
    "profileId" INTEGER,

    CONSTRAINT "ProfilePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachement" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mimetype" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "MessageAttachement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePhoto_name_key" ON "ProfilePhoto"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MessageAttachement_name_key" ON "MessageAttachement"("name");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "MessageAttachement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePhoto" ADD CONSTRAINT "ProfilePhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
