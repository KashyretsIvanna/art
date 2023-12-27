import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class AppleUserNameRes {
  isUserHaveName: boolean;
}

export class AppleUserNameReq extends PickType(FullUserDto, ['name']) {}
