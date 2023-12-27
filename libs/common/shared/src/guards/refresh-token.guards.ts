import { PrismaService } from '@app/common/prisma';
import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(private prisma: PrismaService, private reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext) {
    if (!(await super.canActivate(context))) {
      return false;
    }

    const req = context.switchToHttp().getRequest();

    req.user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
    });

    if (!req.user) {
      throw new InternalServerErrorException('Unable to find user...');
    }

    return true;
  }
}
