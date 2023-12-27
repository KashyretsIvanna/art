import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class GetPhoneNumberReq extends PickType(FullUserDto, ['phoneNumber']) {}
