import { IntersectionType } from '@nestjs/swagger';

import { ProfileIdReq } from '../../common';

export class RewindReq extends IntersectionType(ProfileIdReq) {}
