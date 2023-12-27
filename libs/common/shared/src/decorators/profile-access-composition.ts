import { HttpStatus, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { AccessComposition } from './access-composition.decorator';
import { ProfileExistsGuard } from '../guards';

export const ProfileAccessComposition = () =>
  applyDecorators(
    AccessComposition(),
    UseGuards(ProfileExistsGuard),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Profile does not exists',
    })
  );
