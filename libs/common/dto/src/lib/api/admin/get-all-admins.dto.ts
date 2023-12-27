import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { FullUserDto } from '../../common';

export class AdminGetAdminRes extends PickType(FullUserDto, [
  'name',
  'email',
]) {}

export class GetAllAdminsQueryReq {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  take: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;
}

export class GetAllAdminsRes {
  admins: AdminGetAdminRes[];
  pages: number;
}
