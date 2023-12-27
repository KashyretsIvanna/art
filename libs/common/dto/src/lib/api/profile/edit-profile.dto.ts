import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { FullUserDto } from '../../common';
import { FullProfileDto } from '../../common/full-profile.dto';

export class ProfileEditClassificationsReq {
  @ArrayUnique()
  @ArrayNotEmpty({ message: 'Choose at least 1 item!' })
  @IsNumber({}, { each: true })
  @IsOptional()
  classifications?: number[];

  @ArrayUnique()
  @IsNotEmpty({ message: 'Choose at least 1 item!' })
  @IsNumber({}, { each: true })
  @IsOptional()
  orientations?: number[];

  @ArrayUnique()
  @IsNotEmpty({ message: 'Choose at least 1 item!' })
  @IsNumber({}, { each: true })
  @IsOptional()
  galleryTypes?: number[];
}

export class EditProfileReq extends IntersectionType(
  PartialType(
    PickType(FullProfileDto, [
      'galleryName',
      'age',
      'gender',
      'profileDescription',
    ])
  ),
  PartialType(PickType(FullUserDto, ['name']))
) {
  @ValidateNested()
  @Type(() => ProfileEditClassificationsReq)
  profileClassifications?: ProfileEditClassificationsReq;
}
