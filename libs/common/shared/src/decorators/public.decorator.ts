import { SetMetadata } from '@nestjs/common';

export const PROFILE_NOT_REQUIRED = 'ProfileIsNotRequired';
export const ProfileNotRequired = () => SetMetadata(PROFILE_NOT_REQUIRED, true);