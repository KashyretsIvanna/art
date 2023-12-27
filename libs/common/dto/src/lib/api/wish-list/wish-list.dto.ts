import { PickType } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDateString, IsString } from 'class-validator';

import { FullUserDto } from '../../common';

export class WishListReq extends PickType(FullUserDto, ['name', 'email']) {
  @IsDateString()
  birth: string;

  @IsString({ each: true })
  socialMedia: string[];

  @IsString({ each: true })
  socialMediaLinks: string[];

  @ArrayNotEmpty()
  @IsString({ each: true })
  role: string[];
}

/* eslint-disable @typescript-eslint/naming-convention */
export class WishListData {
  'User name': string;
  Email: string;
  'Date of birth': string;
  'Social Media': string;
  'Social Media Links': string;
  Role: string;
}
/* eslint-disable @typescript-eslint/naming-convention */

class WishListInfoRes {
  id: string;
  createdTime: string;
  fields: WishListData;
}

export class WishListRes {
  records: WishListInfoRes[];
}
