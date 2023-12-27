import { BadRequestException } from '@nestjs/common';
import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsNumber,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { FullProfileDto } from '../../common/full-profile.dto';
import { LocationPreferences } from '../user/settings.dto';

function validateClassifications({
  value,
  rolesToValidate,
  role,
}: {
  value: number[];
  rolesToValidate: UserRole[];
  role: UserRole;
}) {
  if (rolesToValidate.includes(role)) {
    if (!value) {
      throw new BadRequestException('Choose at least 1 item!');
    }

    return true;
  }

  if (value) {
    throw new BadRequestException('Bad classifications specified');
  }

  return false;
}

export class ProfileClassificationsReq {
  @ArrayNotEmpty({ message: 'Choose at least 1 item!' })
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @ValidateIf((obj, value): boolean =>
    validateClassifications({
      value,
      rolesToValidate: [UserRole.GALLERY, UserRole.ARTIST],
      role: obj.role,
    })
  )
  @IsOptional()
  classifications?: number[];

  @ArrayNotEmpty({ message: 'Choose at least 1 item!' })
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @ValidateIf((obj, value): boolean =>
    validateClassifications({
      value,
      rolesToValidate: [UserRole.GALLERY],
      role: obj.role,
    })
  )
  @IsOptional()
  orientations?: number[];

  @ArrayNotEmpty({ message: 'Choose at least 1 item!' })
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @ValidateIf((obj, value): boolean =>
    validateClassifications({
      value,
      rolesToValidate: [UserRole.GALLERY],
      role: obj.role,
    })
  )
  @IsOptional()
  galleryTypes?: number[];
}

class CommonProfileReq extends IntersectionType(
  PartialType(PickType(FullProfileDto, ['profileDescription'])),
  PickType(FullProfileDto, ['city', 'country'])
) {
  @ValidateNested()
  @Type(() => LocationPreferences)
  location: LocationPreferences;
}

export class CollectorProfileReq extends IntersectionType(
  PickType(CommonProfileReq, ['location', 'profileDescription']),
  PartialType(PickType(FullProfileDto, ['age', 'gender']))
) {}

export class ArtistProfileReq extends IntersectionType(
  OmitType(ProfileClassificationsReq, ['galleryTypes', 'orientations']),
  PartialType(PickType(FullProfileDto, ['age', 'gender'])),
  PickType(CommonProfileReq, ['location', 'profileDescription'])
) {}

export class GalleryProfileReq extends IntersectionType(
  PartialType(PickType(FullProfileDto, ['galleryName'])),
  PickType(CommonProfileReq, ['location', 'profileDescription']),
  ProfileClassificationsReq
) {}

export class ProfileReq extends IntersectionType(
  PickType(FullProfileDto, [
    'galleryName',
    'age',
    'gender',
    'role',
    'profileDescription',
  ]),
  ProfileClassificationsReq,
  PickType(CommonProfileReq, ['location', 'city', 'country'])
) {}
