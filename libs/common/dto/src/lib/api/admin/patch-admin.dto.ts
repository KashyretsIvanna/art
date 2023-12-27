import { PickType } from '@nestjs/swagger';

import { FullUserDto } from '../../common';

export class PatchAdminReq extends PickType(FullUserDto, ['password']) {}
