import { UserReq } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import {
  DailyActions,
  NotificationsService,
} from '@app/components/notifications';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PlanLimitName } from '@prisma/client';

@Injectable()
export class BoostService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async boostMe(user: UserReq) {
    const [limit, userSubscription, prevBoost] = await Promise.all([
      this.prisma.boostLimits.findUnique({
        where: {
          profileId: user.profile.id,
        },
      }),
      this.prisma.userSubscription.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          plan: {
            select: {
              planName: true,
              planLimits: {
                where: {
                  name: PlanLimitName.BOOST,
                },
                select: {
                  limit: true,
                  days: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.boosts.findFirst({
        where: {
          profileId: user.profile.id,
          endTime: { gte: new Date().toISOString() },
        },
      }),
    ]);

    if (prevBoost && prevBoost.endTime > new Date()) {
      throw new BadRequestException('You already boosted your profile');
    }

    if (!userSubscription) {
      throw new BadRequestException('No account type selected');
    }

    const actionsPerPeriod = userSubscription.plan.planLimits[0].limit;
    const periodInDays = userSubscription.plan.planLimits[0].days;

    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + (periodInDays || 0));

    if (
      !limit ||
      (limit && limit.resetDate && new Date(limit.resetDate) <= new Date())
    ) {
      await this.prisma.boostLimits.upsert({
        where: { profileId: user.profile.id },
        update: {
          remainingBoosts: actionsPerPeriod,
          resetDate: periodInDays ? resetDate : null,
        },
        create: {
          profileId: user.profile.id,
          resetDate: periodInDays ? resetDate : null,
          remainingBoosts: actionsPerPeriod,
        },
      });
    }

    const currentLimit = await this.prisma.boostLimits.findUnique({
      where: {
        profileId: user.profile.id,
      },
    });

    if (!currentLimit) {
      throw new BadRequestException(
        'Something went wrong with boost limits'
      );
    }

    if (currentLimit.remainingBoosts === 0) {
      throw new ForbiddenException(
        'You have used all your boosts available'
      );
    }
    const expirationMinutes = await this.prisma.applicationSettings.findFirst();

    if (!expirationMinutes) {
      throw new InternalServerErrorException(
        'No expiration minutes constants not found'
      );
    }
    const expirationDate = new Date();
    expirationDate.setMinutes(
      expirationDate.getMinutes() + +expirationMinutes.boostExpirationMinutes
    );

    const [boost] = await this.prisma.$transaction([
      this.prisma.boosts.create({
        data: {
          profileId: user.profile.id,
          endTime: expirationDate,
          startTime: new Date().toISOString(),
        },
      }),
      this.prisma.boostLimits.update({
        where: { profileId: user.profile.id },
        data: {
          remainingBoosts: currentLimit.remainingBoosts
            ? currentLimit.remainingBoosts - 1
            : null,
        },
      }),
    ]);

    await this.notificationsService.cronSendNotification(
      user.profile.id,
      DailyActions.BOOST
    );

    return boost;
  }
}
