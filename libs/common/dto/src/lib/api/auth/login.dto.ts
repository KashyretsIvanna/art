import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class LoginReq extends PickType(FullUserDto, ['email', 'password']) {}
