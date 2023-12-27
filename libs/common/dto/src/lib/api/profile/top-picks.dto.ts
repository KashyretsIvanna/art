import { IntersectionType, PickType } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

import { FullProfileDto, FullUserDto } from '../../common';

export class TopPicksReq {
  @Max(10)
  @Min(1)
  @IsNumber()
  amount: number;
}

export class TopPicksRes extends IntersectionType(
  PickType(FullProfileDto, ['id']),
  PickType(FullUserDto, ['name'])
) {}

export class TopPicksPhotoRes extends TopPicksRes {
  avatarId: number;
}
