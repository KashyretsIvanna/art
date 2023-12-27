import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    return request.user.isEmailVerified;
  }
}
