import { IntersectionType, PickType } from '@nestjs/swagger';

import { FullLikesDto, FullUserDto } from '../../common';

export class ShortProfileByIdRes extends IntersectionType(
  PickType(FullLikesDto, ['profileId']),
  PickType(FullUserDto, ['name'])
) {}

export class ShortProfilePhotoPhotoRes extends ShortProfileByIdRes {
  avatarId: number;
}

export class ShortProfilePaginatedRes {
  data: ShortProfilePhotoPhotoRes[];
  total: number;
}
