import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class EmailVerificationReq extends PickType(FullUserDto, ['email']) {}
