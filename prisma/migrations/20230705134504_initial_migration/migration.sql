-- CreateEnum
CREATE TYPE "EmailNotificationsRecieveType" AS ENUM ('ALL', 'IMPORTANT', 'DISABLED');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'APPLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ARTIST', 'COLLECTOR', 'GALLERY');

-- CreateEnum
CREATE TYPE "PlanName" AS ENUM ('STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PlanLimitName" AS ENUM ('LIKE', 'SUPER_LIKE', 'DIS_LIKE', 'FAVORITE', 'BOOST', 'REWIND', 'TOP_PICKS');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('LIKE', 'SUPER_LIKE', 'UNLIKE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "registrationToken" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSettings" (
    "id" SERIAL NOT NULL,
    "emailNotificationsRecieveType" "EmailNotificationsRecieveType" NOT NULL DEFAULT 'ALL',
    "pushOnNewMessage" BOOLEAN NOT NULL DEFAULT true,
    "pushOnLikes" BOOLEAN NOT NULL DEFAULT true,
    "pushOnAddedToFavorites" BOOLEAN NOT NULL DEFAULT true,
    "pushOnNewMatch" BOOLEAN NOT NULL DEFAULT true,
    "pushOnAppNews" BOOLEAN NOT NULL DEFAULT true,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "distancePreference" INTEGER NOT NULL DEFAULT 50,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "ProfileSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "providerUserId" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationCode" (
    "id" SERIAL NOT NULL,
    "verificationCode" VARCHAR(5) NOT NULL,
    "expirationTime" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '15 minutes',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EmailVerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanLimits" (
    "id" SERIAL NOT NULL,
    "limit" INTEGER,
    "days" INTEGER,
    "name" "PlanLimitName" NOT NULL,
    "planId" INTEGER NOT NULL,

    CONSTRAINT "PlanLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumPlan" (
    "id" SERIAL NOT NULL,
    "planName" "PlanName" NOT NULL,
    "durationDays" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PremiumPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSubscription" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profileId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,

    CONSTRAINT "ProfileSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationsTemplate" (
    "id" SERIAL NOT NULL,
    "emailNotifications" JSONB,
    "pushNotifications" JSONB,

    CONSTRAINT "NotificationsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshToken" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "age" INTEGER,
    "gender" "GenderType",
    "birthdate" TIMESTAMP(3),
    "aboutMe" TEXT,
    "country" VARCHAR(50),
    "city" VARCHAR(50),
    "role" "UserRole" NOT NULL,
    "galleryName" VARCHAR(40),
    "profileDescription" TEXT,
    "autoLocation" BOOLEAN NOT NULL DEFAULT true,
    "manualLocationCountry" VARCHAR(50),
    "manualCity" VARCHAR(50),
    "isLookingForGallery" BOOLEAN DEFAULT false,
    "isLookingForArtist" BOOLEAN DEFAULT false,
    "isLookingForCollector" BOOLEAN DEFAULT false,

    CONSTRAINT "Profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnLikes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unLikedUserId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "unLikeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Likes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likedUserId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "expirationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorites" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "favoriteUserId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rewinds" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rewoundProfileId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "actionType" "ActionType" NOT NULL,

    CONSTRAINT "Rewinds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperLikeLimits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "remainingSuperLikes" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "SuperLikeLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperLikes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" INTEGER NOT NULL,
    "superLikedProfileId" INTEGER NOT NULL,

    CONSTRAINT "SuperLikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationType" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePhotos" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "photoUrl" VARCHAR(255) NOT NULL,
    "photoOrder" INTEGER NOT NULL,

    CONSTRAINT "ProfilePhotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewindLimits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "remainingRewinds" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "RewindLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoostLimits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "remainingBoosts" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "BoostLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boosts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '30 minutes',

    CONSTRAINT "Boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteLimits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "remainingFavorites" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "FavoriteLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classifications" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classificationName" VARCHAR(255) NOT NULL,

    CONSTRAINT "Classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileClassifications" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "classificationId" INTEGER NOT NULL,

    CONSTRAINT "ProfileClassifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryTypes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "typeName" VARCHAR(255) NOT NULL,

    CONSTRAINT "GalleryTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileGalleryTypes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "ProfileGalleryTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtOrientations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orientationName" VARCHAR(255) NOT NULL,

    CONSTRAINT "ArtOrientations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileArtOrientations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "orientationId" INTEGER NOT NULL,

    CONSTRAINT "ProfileArtOrientations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikeLimits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "remainingLikes" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "LikeLimits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopPicksLimit" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "remainingPicks" INTEGER,
    "resetDate" TIMESTAMP(3),

    CONSTRAINT "TopPicksLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryClassificationFilter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "classificationId" INTEGER NOT NULL,

    CONSTRAINT "GalleryClassificationFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistClassificationFilter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "classificationId" INTEGER NOT NULL,

    CONSTRAINT "ArtistClassificationFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryTypeFilter" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "galleryTypeId" INTEGER NOT NULL,

    CONSTRAINT "GalleryTypeFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orientation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "artOrientationsId" INTEGER NOT NULL,

    CONSTRAINT "Orientation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationSettings" (
    "id" SERIAL NOT NULL,
    "likeExpirationDays" INTEGER NOT NULL,
    "unLikeExpirationDays" INTEGER NOT NULL,
    "boostExpirationMinutes" INTEGER NOT NULL,

    CONSTRAINT "ApplicationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembersOnRooms" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "memberId" INTEGER[],

    CONSTRAINT "MembersOnRooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" VARCHAR(255),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "attachmentId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "mimetype" VARCHAR(255) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSettings_profileId_key" ON "ProfileSettings"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_providerUserId_key" ON "SocialAccount"("providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationCode_verificationCode_key" ON "EmailVerificationCode"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationCode_userId_key" ON "EmailVerificationCode"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimits_name_planId_key" ON "PlanLimits"("name", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSubscription_planId_profileId_key" ON "ProfileSubscription"("planId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profiles_userId_key" ON "Profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UnLikes_unLikedUserId_userId_key" ON "UnLikes"("unLikedUserId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_userId_likedUserId_key" ON "Likes"("userId", "likedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorites_userId_favoriteUserId_key" ON "Favorites"("userId", "favoriteUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperLikeLimits_userId_key" ON "SuperLikeLimits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperLikes_superLikedProfileId_profileId_key" ON "SuperLikes"("superLikedProfileId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "RewindLimits_userId_key" ON "RewindLimits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoostLimits_userId_key" ON "BoostLimits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteLimits_userId_key" ON "FavoriteLimits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Classifications_classificationName_key" ON "Classifications"("classificationName");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTypes_typeName_key" ON "GalleryTypes"("typeName");

-- CreateIndex
CREATE UNIQUE INDEX "ArtOrientations_orientationName_key" ON "ArtOrientations"("orientationName");

-- CreateIndex
CREATE UNIQUE INDEX "LikeLimits_userId_key" ON "LikeLimits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopPicksLimit_profileId_key" ON "TopPicksLimit"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryClassificationFilter_userId_classificationId_key" ON "GalleryClassificationFilter"("userId", "classificationId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistClassificationFilter_userId_classificationId_key" ON "ArtistClassificationFilter"("userId", "classificationId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryTypeFilter_userId_galleryTypeId_key" ON "GalleryTypeFilter"("userId", "galleryTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Orientation_userId_artOrientationsId_key" ON "Orientation"("userId", "artOrientationsId");

-- CreateIndex
CREATE UNIQUE INDEX "MembersOnRooms_roomId_key" ON "MembersOnRooms"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "MembersOnRooms_memberId_key" ON "MembersOnRooms"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_attachmentId_key" ON "Message"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "File_name_key" ON "File"("name");

-- AddForeignKey
ALTER TABLE "ProfileSettings" ADD CONSTRAINT "ProfileSettings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationCode" ADD CONSTRAINT "EmailVerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanLimits" ADD CONSTRAINT "PlanLimits_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PremiumPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSubscription" ADD CONSTRAINT "ProfileSubscription_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSubscription" ADD CONSTRAINT "ProfileSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PremiumPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profiles" ADD CONSTRAINT "Profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnLikes" ADD CONSTRAINT "UnLikes_unLikedUserId_fkey" FOREIGN KEY ("unLikedUserId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedUserId_fkey" FOREIGN KEY ("likedUserId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD CONSTRAINT "Favorites_favoriteUserId_fkey" FOREIGN KEY ("favoriteUserId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewinds" ADD CONSTRAINT "Rewinds_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rewinds" ADD CONSTRAINT "Rewinds_rewoundProfileId_fkey" FOREIGN KEY ("rewoundProfileId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikeLimits" ADD CONSTRAINT "SuperLikeLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikes" ADD CONSTRAINT "SuperLikes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperLikes" ADD CONSTRAINT "SuperLikes_superLikedProfileId_fkey" FOREIGN KEY ("superLikedProfileId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePhotos" ADD CONSTRAINT "ProfilePhotos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewindLimits" ADD CONSTRAINT "RewindLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostLimits" ADD CONSTRAINT "BoostLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boosts" ADD CONSTRAINT "Boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLimits" ADD CONSTRAINT "FavoriteLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClassifications" ADD CONSTRAINT "ProfileClassifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClassifications" ADD CONSTRAINT "ProfileClassifications_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGalleryTypes" ADD CONSTRAINT "ProfileGalleryTypes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileGalleryTypes" ADD CONSTRAINT "ProfileGalleryTypes_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "GalleryTypes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileArtOrientations" ADD CONSTRAINT "ProfileArtOrientations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileArtOrientations" ADD CONSTRAINT "ProfileArtOrientations_orientationId_fkey" FOREIGN KEY ("orientationId") REFERENCES "ArtOrientations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeLimits" ADD CONSTRAINT "LikeLimits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopPicksLimit" ADD CONSTRAINT "TopPicksLimit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryClassificationFilter" ADD CONSTRAINT "GalleryClassificationFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryClassificationFilter" ADD CONSTRAINT "GalleryClassificationFilter_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistClassificationFilter" ADD CONSTRAINT "ArtistClassificationFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistClassificationFilter" ADD CONSTRAINT "ArtistClassificationFilter_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "Classifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryTypeFilter" ADD CONSTRAINT "GalleryTypeFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryTypeFilter" ADD CONSTRAINT "GalleryTypeFilter_galleryTypeId_fkey" FOREIGN KEY ("galleryTypeId") REFERENCES "GalleryTypes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orientation" ADD CONSTRAINT "Orientation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orientation" ADD CONSTRAINT "Orientation_artOrientationsId_fkey" FOREIGN KEY ("artOrientationsId") REFERENCES "ArtOrientations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembersOnRooms" ADD CONSTRAINT "MembersOnRooms_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
