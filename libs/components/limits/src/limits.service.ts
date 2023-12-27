import { LimitsDtoReq } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PlanLimitName, PlanName, PrismaPromise } from '@prisma/client';

@Injectable()
export class LimitsService {
  constructor(private prisma: PrismaService) {}

  countResetDate(days: number | null) {
    if (days === null) {
      return null;
    }

    const msInDay = 1000 * 60 * 60 * 24;

    return new Date(new Date().getMilliseconds() + msInDay * days);
  }

  async changeProjectLimits(newLimitsData: LimitsDtoReq[]) {
    const [standardPlan, premiumPlan] = await Promise.all([
      this.prisma.premiumPlan.findUnique({
        where: {
          planName: PlanName.STANDARD,
        },
      }),
      this.prisma.premiumPlan.findUnique({
        where: {
          planName: PlanName.PREMIUM,
        },
      }),
    ]);

    if (!standardPlan || !premiumPlan) {
      throw new InternalServerErrorException('Provide some plans');
    }

    const currentPlanLimits = await this.prisma.planLimits.findMany({
      select: {
        name: true,
        days: true,
        limit: true,
        planId: true,
        plan: {
          select: {
            planName: true,
          },
        },
      },
    });

    const newFavoriteLimit = newLimitsData.filter(
      (el) => el.limitName === PlanLimitName.FAVORITE
    );
    const newRewindLimit = newLimitsData.filter(
      (el) => el.limitName === PlanLimitName.REWIND
    );
    const newLikeLimit = newLimitsData.filter(
      (el) => el.limitName === PlanLimitName.LIKE
    );

    await this.prisma.$transaction(async (tx) => {
      const tasksArray: PrismaPromise<any>[] = [];

      newLimitsData.map((newLimit) => {
        tasksArray.push(
          tx.planLimits.update({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              name_planId: {
                planId: standardPlan.id,
                name: newLimit.limitName,
              },
            },
            data: {
              days: newLimit.days,
              limit: newLimit.limit,
            },
          })
        );
      });

      if (newLikeLimit.length) {
        newLikeLimit.map(async (newLimit) => {
          const currentLimit = currentPlanLimits.filter(
            (currentLimit) =>
              currentLimit.name === newLimit.limitName &&
              currentLimit.plan.planName === newLimit.planName
          )[0];

          const resetDate =
            typeof newLimit.days === 'undefined'
              ? this.countResetDate(currentLimit.days)
              : this.countResetDate(newLimit.days);

          tasksArray.push(
            tx.likeLimits.updateMany({
              where: {
                profile: {
                  user: {
                    userSubscription: {
                      AND: {
                        endDate: null,
                        plan: {
                          planName: newLimit.planName,
                        },
                      },
                    },
                  },
                },
              },
              data: {
                remainingLikes:
                  typeof newLimit.limit !== 'undefined'
                    ? newLimit.limit
                    : currentLimit.limit,
                resetDate: resetDate,
              },
            })
          );
        });
      }

      if (newRewindLimit.length) {
        newRewindLimit.map(async (newLimit) => {
          const currentLimit = currentPlanLimits.filter(
            (currentLimit) =>
              currentLimit.name === newLimit.limitName &&
              currentLimit.plan.planName === newLimit.planName
          )[0];

          const resetDate =
            typeof newLimit.days === 'undefined'
              ? this.countResetDate(currentLimit.days)
              : this.countResetDate(newLimit.days);

          tasksArray.push(
            tx.rewindLimits.updateMany({
              where: {
                profile: {
                  user: {
                    userSubscription: {
                      AND: {
                        endDate: null,
                        plan: {
                          planName: newLimit.planName,
                        },
                      },
                    },
                  },
                },
              },
              data: {
                remainingRewinds:
                  typeof newLimit.limit !== 'undefined'
                    ? newLimit.limit
                    : currentLimit.limit,
                resetDate: resetDate,
              },
            })
          );
        });
      }

      if (newFavoriteLimit.length) {
        newFavoriteLimit.map(async (newLimit) => {
          const currentLimit = currentPlanLimits.filter(
            (currentLimit) =>
              currentLimit.name === newLimit.limitName &&
              currentLimit.plan.planName === newLimit.planName
          )[0];

          const resetDate =
            typeof newLimit.days === 'undefined'
              ? this.countResetDate(currentLimit.days)
              : this.countResetDate(newLimit.days);

          tasksArray.push(
            tx.favoriteLimits.updateMany({
              where: {
                profile: {
                  user: {
                    userSubscription: {
                      AND: {
                        endDate: null,
                        plan: {
                          planName: newLimit.planName,
                        },
                      },
                    },
                  },
                },
              },
              data: {
                remainingFavorites:
                  typeof newLimit.limit !== 'undefined'
                    ? newLimit.limit
                    : currentLimit.limit,
                resetDate: resetDate,
              },
            })
          );
        });
      }
      await Promise.all(tasksArray);
    });
  }
}
