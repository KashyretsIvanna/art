import { IntersectionType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class GalleryFilterReq {
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @IsOptional()
  galleryClassifications?: number[];

  @ArrayUnique()
  @IsNumber({}, { each: true })
  @IsOptional()
  orientations?: number[];

  @ArrayUnique()
  @IsNumber({}, { each: true })
  @IsOptional()
  galleryTypes?: number[];
}

export class ArtistFilterReq {
  @IsNumber({}, { each: true })
  @ArrayUnique()
  @IsOptional()
  artistClassifications?: number[];
}

export class AllProfileFiltersReq extends IntersectionType(
  PickType(GalleryFilterReq, [
    'galleryClassifications',
    'galleryTypes',
    'orientations',
  ]),
  PickType(ArtistFilterReq, ['artistClassifications'])
) {}

export class ProfilePreferencesReq {
  @IsBoolean()
  @IsOptional()
  isLookingForGallery?: boolean;

  @IsBoolean()
  @IsOptional()
  isLookingForArtist?: boolean;

  @IsBoolean()
  @IsOptional()
  isLookingForCollector?: boolean;
}

export class ProfileLookingForReq {
  @ValidateNested()
  @Type(() => ProfilePreferencesReq)
  @IsObject()
  preferences: ProfilePreferencesReq;

  @ValidateNested()
  @Type(() => AllProfileFiltersReq)
  @IsObject()
  filters: AllProfileFiltersReq;
}

export class ProfileLookingForRes extends IntersectionType(
  PickType(ProfilePreferencesReq, [
    'isLookingForArtist',
    'isLookingForCollector',
    'isLookingForGallery',
  ])
) {}
