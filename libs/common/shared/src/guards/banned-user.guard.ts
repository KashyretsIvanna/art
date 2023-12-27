import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class BannedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user.profile?.role) {
      return request.user.profile.role !== UserRole.BANNED;
    }

    return true;
  }
}
