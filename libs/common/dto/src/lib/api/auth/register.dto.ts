import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class RegisterReq extends PickType(FullUserDto, [
  'name',
  'email',
  'password',
]) {}
