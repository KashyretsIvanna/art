import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { BannedUserGuard, EmailVerificationGuard } from '../guards';
import { AccessTokenGuard } from '../guards/access-token.guard';

export const AccessComposition = () =>
  applyDecorators(
    ApiBearerAuth(),
    UseGuards(AccessTokenGuard, EmailVerificationGuard, BannedUserGuard),
    ApiResponse({ status: 401, description: 'Invalid token' }),
    ApiResponse({ status: 403, description: 'Email not verified' })
  );
