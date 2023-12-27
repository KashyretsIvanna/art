import { PrismaService } from '@app/common/prisma';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PlanName, UserRole } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private prisma: PrismaService, private reflector: Reflector) {
    super();
  }

  override async canActivate(context: ExecutionContext) {
    if (!(await super.canActivate(context))) {
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    const req = context.switchToHttp().getRequest();

    req.user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
    });

    if (!req.user) {
      throw new UnauthorizedException('User doenst exist');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (profile) {
      req.user.profile = profile;

      const plan = await this.prisma.userSubscription.findUnique({
        where: { userId: req.user.id },
        select: {
          plan: {
            select: {
              planName: true,
            },
          },
        },
      });

      req.user.plan = plan;

      req.user.isPremium = plan
        ? plan.plan.planName === PlanName.PREMIUM
          ? true
          : false
        : false;
    } else {
      req.user.profile = null;
      req.user.plan = false;
    }

    if (
      requiredRoles &&
      (!req.user.profile ||
        !requiredRoles.some((role) => req.user.profile.role === role))
    ) {
      throw new ForbiddenException(
        `This route is not allowed for role ${req.user.profile.role}`
      );
    }

    return true;
  }
}
