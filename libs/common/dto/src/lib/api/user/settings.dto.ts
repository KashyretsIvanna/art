import { PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { FullSettingsDto, FullUserDto } from '../../common';

export class PushNotificationsPreferences extends PartialType(
  PickType(FullSettingsDto, [
    'pushOnLikes',
    'pushOnAppNews',
    'pushOnNewMatch',
    'pushOnNewMessage',
    'pushOnAddedToFavorites',
  ])
) {}

export class EmailNotificationsPreferences extends PickType(FullSettingsDto, [
  'emailNotificationsRecieveType',
]) {}

export class NotificationsPreferences {
  @ValidateNested()
  @Type(() => EmailNotificationsPreferences)
  @IsOptional()
  email?: EmailNotificationsPreferences;

  @ValidateNested()
  @Type(() => PushNotificationsPreferences)
  @IsOptional()
  push?: PushNotificationsPreferences;
}

export class LocationPreferences extends PickType(FullSettingsDto, [
  'lat',
  'lng',
  'isLocationAuto',
]) {}

class DiscoveryPreferences extends PartialType(
  PickType(FullSettingsDto, ['distancePreference'])
) {
  @Min(-90)
  @Max(90)
  @IsNumber()
  @IsOptional()
  latPreference: number;

  @Min(-180)
  @Max(180)
  @IsNumber()
  @IsOptional()
  lngPreference: number;

  @ValidateNested()
  @Type(() => LocationPreferences)
  @IsOptional()
  location?: LocationPreferences;
}

export class DiscoveryPreferencesRes {
  distancePreference: number | null;
  location: LocationRes;
  cityPreference: string | null;
  countryPreference: string | null;
  isLocationPreferenceAuto: boolean;
}

export class LocationRes {
  lat: number | null;
  lng: number | null;
  isLocationAuto: boolean;
}
export class UserSettingsReq extends PartialType(
  PickType(FullUserDto, ['email', 'password', 'phoneNumber'])
) {
  @ValidateNested()
  @Type(() => NotificationsPreferences)
  @IsOptional()
  notifications?: NotificationsPreferences;

  @ValidateNested()
  @Type(() => DiscoveryPreferences)
  @IsOptional()
  discovery?: DiscoveryPreferences;
}

export class UserSettingsRes {
  notifications: NotificationsPreferences;

  discovery: DiscoveryPreferencesRes;
}
