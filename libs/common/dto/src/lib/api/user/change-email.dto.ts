import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class ChangeEmailReq extends PickType(FullUserDto, ['email']) {}
