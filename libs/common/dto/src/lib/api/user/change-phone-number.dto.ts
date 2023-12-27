import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class ChangePhoneNumberReq extends PickType(FullUserDto, [
  'phoneNumber',
]) {}
