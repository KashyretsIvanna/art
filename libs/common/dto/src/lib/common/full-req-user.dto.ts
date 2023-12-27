import { IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';

import { FullProfileDto } from './full-profile.dto';
import { FullUserDto } from './full-user.dto';

export class UserReq extends IntersectionType(
  OmitType(FullUserDto, ['password', 'role']),
  PickType(FullProfileDto, ['role', 'id'])
) {
  @ValidateNested()
  @Type(() => FullProfileDto)
  profile: FullProfileDto;

  @IsBoolean()
  isPremium: boolean;
}
