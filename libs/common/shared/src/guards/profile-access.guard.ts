import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PROFILE_NOT_REQUIRED } from '../decorators';

@Injectable()
export class ProfileExistsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const ProfileIsNotRequired = this.reflector.getAllAndOverride<boolean>(
      PROFILE_NOT_REQUIRED,
      [context.getHandler(), context.getClass()]
    );

    if (ProfileIsNotRequired) {
      return true;
    }

    if (!request.user.profile) {
      throw new BadRequestException('User profile not found');
    }

    return true;
  }
}
