import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import {
  EmailNotificationsRecieveType,
  GenderType,
  UserRole,
} from '@prisma/client';

import { FullProfileDto, FullUserDto } from '../../common';
import { StepsToCompleteProfile } from '../user/get-user.dto';

export class Classification {
  classificationName: string;
  id: number;
}

export class Orientations {
  orientationName: string;
  id: number;
}

export class GalleryTypes {
  typeName: string;
  id: number;
}
export class ProfileData extends IntersectionType(
  PickType(FullProfileDto, [
    'id',
    'aboutMe',
    'age',
    'birthdate',
    'city',
    'country',
    'galleryName',
    'profileDescription',
    'isLookingForArtist',
    'isLookingForCollector',
    'isLookingForGallery',
  ]),
  PickType(FullUserDto, [
    'isEmailVerified',
    'isPhoneVerified',
    'email',
    'name',
    'phoneNumber',
  ])
) {
  @ApiProperty({
    enum: UserRole,
  })
  role: UserRole;
  @ApiProperty({
    enum: GenderType,
  })
  gender: GenderType;

  isInFavorites: boolean;
}

export class ClassificationsData {
  profileArtOrientations: Orientations[];
  profileClassifications: Classification[];
  profileGalleryTypes: GalleryTypes[];
}

export class UserByIdData extends ProfileData {
  userId: number;
  distance: number;
}

export class UserProfileByIdRes extends OmitType(ProfileData, [
  'email',
  'isEmailVerified',
  'isPhoneVerified',
  'name',
  'phoneNumber',
]) {
  classifications: ClassificationsData;
  profilePhotos: number[];
  avatar: number;
  user: UserDataRes;
  isPremium: boolean;
  distance: number;
  isUserUnLiked: boolean;
}

class ProfileSettingsRes {
  @ApiProperty({
    enum: EmailNotificationsRecieveType,
  })
  emailNotificationsRecieveType: EmailNotificationsRecieveType;
  pushOnNewMessage: boolean;
  pushOnLikes: boolean;
  pushOnAddedToFavorites: boolean;
  pushOnNewMatch: boolean;
  pushOnAppNews: boolean;
  distancePreference: number;
}

class AvatarRes {
  id: number;
}

export class ProfileRes extends IntersectionType(
  PickType(FullProfileDto, [
    'isLookingForArtist',
    'isLookingForCollector',
    'isLookingForGallery',
    'isTutorialShown',
  ])
) {
  age: number | null;

  @ApiProperty({
    enum: GenderType,
  })
  gender: GenderType | null;
  birthdate: Date | null;
  aboutMe: string | null;
  country: string | null;
  city: string | null;

  @ApiProperty({
    enum: UserRole,
  })
  role: UserRole;
  galleryName: string | null;
  profileDescription: string | null;
  profileSettings: ProfileSettingsRes;
  profilePhotos: number[];
  avatar: AvatarRes;
  profileLimits: ProfileLimits;
  progress: number;
  classifications: ClassificationsData;
  user: MyUserDataRes;
  id: number;
  isPremium: boolean;
}

class UserDataRes {
  email: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  name: string;
  phoneNumber: string | null;
}
class MyUserDataRes extends UserDataRes {
  steps: StepsToCompleteProfile;
}

export class ProfileLimits {
  likeLimit: number | null;
  rewindLimit: number | null;
  favoriteLimit: number | null;
  picksLimit: number | null;
  renewLikesDays: number | null;
  renewRewindsDays: number | null;
  renewFavoritesDays: number | null;
  renewPicksDays: number | null;
  likeLimitMax: number;
  rewindLimitMax: number;
  favoriteLimitMax: number;
  picksLimitMax: number;
}
