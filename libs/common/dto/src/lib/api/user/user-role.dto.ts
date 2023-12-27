import { IntersectionType, PickType } from '@nestjs/swagger';

import { FullProfileDto } from '../../common';

export class UserRoleReq extends IntersectionType(
  PickType(FullProfileDto, ['role'])
) {}
