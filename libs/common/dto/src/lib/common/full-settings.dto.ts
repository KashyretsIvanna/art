import { EmailNotificationsRecieveType, ProfileSettings } from '@prisma/client';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class FullSettingsDto
  implements Omit<ProfileSettings, 'id' | 'profileId'>
{
  @IsBoolean()
  isLocationPreferenceAuto: boolean;

  @IsBoolean()
  isLocationAuto: boolean;

  @IsString()
  cityPreference: string;

  @IsString()
  countryPreference: string;

  @IsIn(Object.values(EmailNotificationsRecieveType))
  emailNotificationsRecieveType: EmailNotificationsRecieveType;

  @IsBoolean()
  pushOnNewMessage: boolean;

  @IsBoolean()
  pushOnLikes: boolean;

  @IsBoolean()
  pushOnAddedToFavorites: boolean;

  @IsBoolean()
  pushOnNewMatch: boolean;

  @IsBoolean()
  pushOnAppNews: boolean;

  @Min(-90)
  @Max(90)
  @IsNumber()
  @ValidateIf((obj) => typeof obj.lng !== 'undefined' && obj.lng !== null)
  lat: number;

  @Min(-180)
  @Max(180)
  @IsNumber()
  @ValidateIf((obj) => typeof obj.lng !== 'undefined' && obj.lng !== null)
  lng: number;

  distancePreference: number;
}
