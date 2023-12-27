import { UserReq } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import {
  DailyActions,
  NotificationsService,
} from '@app/components/notifications';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NotificationType, PlanLimitName } from '@prisma/client';
import { capitalize } from 'lodash';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private notifcationsService: NotificationsService
  ) {}

  async favorite(user: UserReq, favoriteProfileId: number) {
    if (user.profile.id === favoriteProfileId) {
      throw new BadRequestException('You can not add this user to favorites');
    }

    const [limit, userSubscription, favorite] = await Promise.all([
      this.prisma.favoriteLimits.findUnique({
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
              durationDays: true,
              planLimits: {
                where: {
                  name: PlanLimitName.FAVORITE,
                },
              },
            },
          },
        },
      }),
      this.prisma.favorites.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          profileId_favoriteProfileId: {
            favoriteProfileId: favoriteProfileId,
            profileId: user.profile.id,
          },
        },
      }),
    ]);

    if (!userSubscription) {
      throw new BadRequestException('No account type selected');
    }

    const actionsPerPeriod = userSubscription.plan.planLimits[0].limit;
    const periodInDays = userSubscription.plan.planLimits[0].days;

    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + (periodInDays || 0));

    if (favorite) {
      return this.removeUserFromFavorites(
        favoriteProfileId,
        user,
        actionsPerPeriod,
        limit?.remainingFavorites
      );
    }

    const isNeedUpdateLimit =
      (!limit ||
        (limit &&
          limit.resetDate &&
          new Date(limit.resetDate) <= new Date())) &&
      actionsPerPeriod !== 0;

    if (periodInDays === 0) {
      throw new BadRequestException('Why only 0 days for limit?');
    }

    if (
      (isNeedUpdateLimit && actionsPerPeriod === 0) ||
      (!isNeedUpdateLimit && limit && limit.remainingFavorites === 0)
    ) {
      throw new BadRequestException('No favorites available');
    }

    const newLimitBody = {
      profileId: user.profile.id,
      resetDate: periodInDays ? resetDate : null,
      remainingFavorites:
        actionsPerPeriod === null ? actionsPerPeriod : actionsPerPeriod - 1,
    };

    const favoriteUser = await this.prisma.$transaction(async (tx) => {
      const [favoriteUser] = await Promise.all([
        tx.favorites.create({
          data: {
            profileId: user.profile.id,
            favoriteProfileId: favoriteProfileId,
          },
        }),
        isNeedUpdateLimit &&
          (await tx.favoriteLimits.upsert({
            where: { profileId: user.profile.id },
            update: newLimitBody,
            create: newLimitBody,
          })),
        !isNeedUpdateLimit &&
          limit &&
          tx.favoriteLimits.update({
            where: { profileId: user.profile.id },
            data: {
              remainingFavorites:
                limit.remainingFavorites !== null
                  ? limit.remainingFavorites - 1
                  : null,
            },
          }),
      ]);

      return favoriteUser;
    });

    await this.notifcationsService.sendNotification(
      favoriteProfileId,
      `${user.name} added you to favorites`,
      NotificationType.FAVORITE,
      user.profile.id
    );

    await this.notifcationsService.cronSendNotification(
      user.profile.id,
      DailyActions.FAVORITES
    );

    return favoriteUser;
  }

  async removeUserFromFavorites(
    favoriteProfileId: number,
    user: UserReq,
    planFavoriteLimit: number | null,
    currentRemainingFavorites?: number | null
  ) {
    if (typeof currentRemainingFavorites === 'undefined') {
      throw new InternalServerErrorException(
        'Why you still have no favorite limit?'
      );
    }

    if (
      typeof currentRemainingFavorites === 'number' &&
      typeof planFavoriteLimit === 'number' &&
      currentRemainingFavorites < planFavoriteLimit
    ) {
      await this.prisma.favoriteLimits.update({
        where: {
          profileId: user.profile.id,
        },
        data: {
          remainingFavorites: currentRemainingFavorites + 1,
        },
      });
    }

    const removedFavorite = await this.prisma.favorites.delete({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        profileId_favoriteProfileId: {
          profileId: user.profile.id,
          favoriteProfileId,
        },
      },
    });

    return removedFavorite;
  }
}
