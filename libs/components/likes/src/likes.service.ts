import { PaginationReq, ShortProfileByIdRes, UserReq } from '@app/common/dto';
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
import {
  ActionType,
  DoubleLikeLimits,
  LikeLimits,
  NotificationType,
  PlanLimitName,
  Prisma,
  PrismaPromise,
} from '@prisma/client';
import { capitalize } from 'lodash';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async likeUser(likedProfileId: number, user: UserReq) {
    const appSettings = await this.prisma.applicationSettings.findFirst();

    if (!appSettings) {
      throw new InternalServerErrorException(
        'No expiration days constants not found'
      );
    }

    const minDislikeDate = new Date();
    minDislikeDate.setDate(
      minDislikeDate.getDate() - +appSettings.unLikeExpirationDays
    );

    const minSuperLikeDate = new Date();
    minSuperLikeDate.setDate(
      minSuperLikeDate.getDate() - +appSettings.likeExpirationDays
    );

    const [
      likeLimit,
      userSubscription,
      lastLike,
      unLike,
      doubleLikeLimit,
      applicationSettings,
      isMeLiked,
      isMeSuperLiked,
    ] = await Promise.all([
      this.prisma.likeLimits.findUnique({
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
                  name: {
                    in: [PlanLimitName.LIKE, PlanLimitName.DOUBLE_LIKE],
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.likes.findFirst({
        where: {
          expirationDate: {
            gte: new Date(),
          },

          // eslint-disable-next-line @typescript-eslint/naming-convention
          profileId: user.profile.id,
          likedProfileId: likedProfileId,
        },
      }),
      this.prisma.unLikes.findFirst({
        where: {
          unLikeDate: {
            gte: minDislikeDate.toISOString(),
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          profileId: user.profile.id,
          unLikedProfileId: likedProfileId,
        },
      }),
      this.prisma.doubleLikeLimits.findUnique({
        where: {
          profileId: user.profile.id,
        },
      }),
      this.prisma.applicationSettings.findFirst(),
      this.prisma.likes.findFirst({
        where: {
          likedProfileId: user.profile.id,
          profileId: likedProfileId,
          expirationDate: {
            gte: new Date(),
          },
        },
      }),
      this.prisma.superLikes.findFirst({
        where: {
          superLikedProfileId: user.profile.id,
          profileId: likedProfileId,
          updatedAt: {
            gte: minSuperLikeDate,
          },
        },
      }),
    ]);

    if (unLike) {
      throw new BadRequestException('You already unLiked this user');
    }

    if (!userSubscription) {
      throw new InternalServerErrorException('No user subscription');
    }

    if (!applicationSettings) {
      throw new InternalServerErrorException('No application settings found');
    }

    //get plan available actions
    const doubleLikePlanLimit = userSubscription.plan.planLimits.find(
      (el) => el.name === PlanLimitName.DOUBLE_LIKE
    );
    const likePlanLimit = userSubscription.plan.planLimits.find(
      (el) => el.name === PlanLimitName.LIKE
    );
    if (!likePlanLimit || !doubleLikePlanLimit) {
      throw new InternalServerErrorException('Not found planLimits');
    }

    //check if need to update limit
    const needToAddNewLikeLimit =
      !likeLimit || (likeLimit.resetDate && likeLimit.resetDate < new Date());

    //check date of last like
    const isLikeExpired = !lastLike || lastLike.expirationDate < new Date();

    //check if like available
    const isLikeAvailable =
      isLikeExpired &&
      ((needToAddNewLikeLimit && likePlanLimit.limit !== 0) ||
        (likeLimit && likeLimit.remainingLikes !== 0));

    const like = await this.prisma.$transaction(async (tx) => {
      let updatedLimitPromise: PrismaPromise<
        DoubleLikeLimits | LikeLimits
      > | null;
      const msInDay = 24 * 60 * 60 * 1000;

      if (isLikeAvailable) {
        const likeResetDate =
          typeof likePlanLimit.days === 'number'
            ? new Date(new Date().getTime() + likePlanLimit.days * msInDay)
            : null;

        const likeLimitBody = {
          profileId: user.profile.id,
          remainingLikes: needToAddNewLikeLimit
            ? likePlanLimit.limit && likePlanLimit.limit - 1
            : likeLimit.remainingLikes && likeLimit.remainingLikes - 1,
          resetDate: needToAddNewLikeLimit ? likeResetDate : undefined,
        };

        updatedLimitPromise =
          !needToAddNewLikeLimit && !likeLimit.remainingLikes
            ? null
            : tx.likeLimits.upsert({
                where: { profileId: likeLimitBody.profileId },
                create: likeLimitBody,
                update: likeLimitBody,
              });
      } else {
        const needUpdateDoubleLikeLimit =
          !doubleLikeLimit ||
          (doubleLikeLimit.resetDate && doubleLikeLimit.resetDate < new Date());

        const isDoubleLikeAvailable =
          !isLikeExpired &&
          ((doubleLikePlanLimit.limit !== 0 && needUpdateDoubleLikeLimit) ||
            (doubleLikeLimit && doubleLikeLimit.remainingDoubleLikes !== 0));

        if (!isDoubleLikeAvailable && !isLikeExpired) {
          throw new BadRequestException('You already liked this user');
        }

        if (!isDoubleLikeAvailable) {
          throw new BadRequestException('You have used all your likes');
        }

        const doubleLikeResetDate =
          typeof doubleLikePlanLimit.days === 'number'
            ? new Date(
                new Date().getTime() + doubleLikePlanLimit.days * msInDay
              )
            : null;

        const doubleLikeLimitBody = {
          profileId: user.profile.id,
          remainingDoubleLikes: needUpdateDoubleLikeLimit
            ? doubleLikePlanLimit.limit && doubleLikePlanLimit.limit - 1
            : doubleLikeLimit.remainingDoubleLikes &&
              doubleLikeLimit.remainingDoubleLikes - 1,
          resetDate: needUpdateDoubleLikeLimit
            ? doubleLikeResetDate
            : undefined,
        };

        updatedLimitPromise =
          !needUpdateDoubleLikeLimit && !doubleLikeLimit.remainingDoubleLikes
            ? null
            : tx.doubleLikeLimits.upsert({
                where: { profileId: doubleLikeLimitBody.profileId },
                create: doubleLikeLimitBody,
                update: doubleLikeLimitBody,
              });
      }

      const likeExpirationDate = new Date(
        new Date().getTime() + applicationSettings.likeExpirationDays * msInDay
      );

      const likeBody = {
        viewed: false,
        expirationDate: likeExpirationDate,
        likedProfileId: likedProfileId,
        profileId: user.profile.id,
      };

      const [newLike] = await Promise.all([
        tx.likes.upsert({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            profileId_likedProfileId: {
              likedProfileId: likedProfileId,
              profileId: user.profile.id,
            },
          },
          create: likeBody,
          update: likeBody,
        }),
        updatedLimitPromise,
      ]);

      await this.notificationsService.sendNotification(
        likedProfileId,
        `${user.name} liked your profile`,
        NotificationType.LIKE,
        user.profile.id
      );

      await this.notificationsService.cronSendNotification(
        user.profile.id,
        DailyActions.LIKE
      );

      if (isMeLiked || isMeSuperLiked) {
        await this.notificationsService.sendNotification(
          likedProfileId,
          `You have a match with ${user.name}`,
          NotificationType.MATCH,
          user.profile.id
        );

        const likedUser = await this.prisma.profile.findUnique({
          where: {
            id: likedProfileId,
          },
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        });

        await this.notificationsService.sendNotification(
          user.profile.id,
          `You have a match with ${likedUser!.user.name}`,
          NotificationType.MATCH,
          likedProfileId
        );
      }

      return newLike;
    });

    return like;
  }

  async getMyLikes(
    user: UserReq,
    pagination?: {
      date?: Date;
      body: PaginationReq;
    }
  ) {
    const result = (await this.prisma.$queryRaw`
    SELECT
        "l1"."likedProfileId"
    FROM "Likes" "l1"
    WHERE "l1"."profileId" = ${user.profile.id}
    AND "l1"."expirationDate" > ${new Date()}
    ${
      pagination && pagination.date
        ? Prisma.sql`"l1"."updatedAt" > ${pagination.date.toISOString()} `
        : Prisma.empty
    }
      ${
        pagination
          ? Prisma.sql`LIMIT ${pagination.body.limit}
  OFFSET ${pagination.body.limit * (pagination.body.page - 1)}`
          : Prisma.empty
      }


  `) as { likedProfileId: number }[];

    return result;
  }

  async getMySuperLikes(user: UserReq) {
    try {
      const appSettings = await this.prisma.applicationSettings.findFirst();

      if (!appSettings) {
        throw new InternalServerErrorException(
          'Please provide settings for app'
        );
      }
      const msInDay = 24 * 60 * 60 * 1000;

      const superLikeExpirationDate = new Date(
        new Date().getTime() - appSettings.likeExpirationDays * msInDay
      );

      const result = (await this.prisma.$queryRaw`
    SELECT
        "sl"."superLikedProfileId"
    FROM "SuperLikes" "sl"
    WHERE "sl"."profileId" = ${user.profile.id}
    AND "sl"."updatedAt" > ${superLikeExpirationDate}



  `) as { superLikedProfileId: number }[];

      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async totalMatches(user: UserReq, superLikeExpirationDate: Date) {
    const data = (await this.prisma.$queryRaw`

    SELECT COUNT(p.id)::integer AS total

        FROM "Profile" p


    LEFT JOIN "Likes" AS "l1" ON "l1"."profileId" = p.id AND "l1"."likedProfileId" = ${
      user.profile.id
    } AND l1."expirationDate" > ${new Date()}
    LEFT JOIN "Likes" AS "l2" ON "l2"."profileId" = ${
      user.profile.id
    } AND "l2"."likedProfileId" = p.id AND l2."expirationDate" > ${new Date()}


    LEFT JOIN "SuperLikes" AS "sl1" ON "sl1"."profileId" = p.id AND "sl1"."superLikedProfileId" = ${
      user.profile.id
    } AND sl1."updatedAt" > ${superLikeExpirationDate}
    LEFT JOIN "SuperLikes" AS "sl2" ON "sl2"."profileId" = ${
      user.profile.id
    } AND "sl2"."superLikedProfileId" = p.id AND sl2."updatedAt" > ${superLikeExpirationDate}

    LEFT JOIN "User" as u ON u.id = p."userId"

    WHERE ((sl2.id IS NOT NULL AND (sl1.id IS NOT NULL OR l1.id IS NOT NULL))
    OR (l2.id IS NOT NULL AND (sl1.id IS NOT NULL OR l1.id IS NOT NULL)))

            `) as {
      total: number;
    }[];

    return data.length ? data[0].total : 0;
  }

  async getMatches({
    user,
    body,
    likedUserProfileId,
  }: {
    user: UserReq;
    body?: PaginationReq;
    likedUserProfileId?: number;
  }) {
    try {
      const applicationSettings =
        await this.prisma.applicationSettings.findFirst();
      if (!applicationSettings) {
        throw new InternalServerErrorException('Provide application settings');
      }

      const msInDay = 24 * 60 * 60 * 1000;

      const superLikeExpirationDate = new Date(
        new Date().getTime() - applicationSettings.likeExpirationDays * msInDay
      );

      const [result, count] = await Promise.all([
        this.prisma.$queryRaw`
    SELECT
       p.id as "profileId",
        u.name
        FROM "Profile" p


    LEFT JOIN "Likes" AS "l1" ON "l1"."profileId" = p.id AND "l1"."likedProfileId" = ${
      user.profile.id
    } AND l1."expirationDate" > ${new Date()}
    LEFT JOIN "Likes" AS "l2" ON "l2"."profileId" = ${
      user.profile.id
    } AND "l2"."likedProfileId" = p.id AND l2."expirationDate" > ${new Date()}


    LEFT JOIN "SuperLikes" AS "sl1" ON "sl1"."profileId" = p.id AND "sl1"."superLikedProfileId" = ${
      user.profile.id
    } AND sl1."updatedAt" > ${superLikeExpirationDate}
    LEFT JOIN "SuperLikes" AS "sl2" ON "sl2"."profileId" = ${
      user.profile.id
    } AND "sl2"."superLikedProfileId" = p.id AND sl2."updatedAt" > ${superLikeExpirationDate}

    LEFT JOIN "User" as u ON u.id = p."userId"

    WHERE ((sl2.id IS NOT NULL AND (sl1.id IS NOT NULL OR l1.id IS NOT NULL))
    OR (l2.id IS NOT NULL AND (sl1.id IS NOT NULL OR l1.id IS NOT NULL)))
    ${
      likedUserProfileId
        ? Prisma.sql`AND p.id = ${likedUserProfileId}`
        : Prisma.empty
    }
    ORDER BY  l2."updatedAt" DESC, sl2."updatedAt" DESC

    ${
      body
        ? Prisma.sql`LIMIT ${body.limit}
  OFFSET ${body.limit * (body.page - 1)}`
        : Prisma.empty
    }
  ` as Promise<ShortProfileByIdRes[]>,
        this.totalMatches(user, superLikeExpirationDate),
      ]);

      const matchesWithPhoto = await Promise.all(
        result.map(async (el) => {
          const firstProfilePhoto = await this.prisma.userPhoto.findFirst({
            where: {
              user: {
                profile: {
                  id: el.profileId,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          });

          return {
            ...el,
            avatarId: firstProfilePhoto?.id ?? null,
          };
        })
      );

      return {
        data: matchesWithPhoto,
        total: count,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async totalUnMatches(
    user: UserReq,
    matchedProfilesId: number[],
    superLikeExpirationDate: Date
  ) {
    const [{ total }] = (await this.prisma.$queryRaw`

        SELECT
        COUNT(p.id) AS total
        FROM "Profile" AS p

        LEFT JOIN "Likes" "l2" ON "l2"."profileId" = ${
          user.profile.id
        } AND "l2"."likedProfileId" = p.id AND l2."expirationDate" > ${new Date()}


       LEFT JOIN "User" as u ON u.id = p."userId"

        WHERE  l2."profileId" IS NOT NULL

    ${
      matchedProfilesId.length
        ? Prisma.sql`AND "l2"."likedProfileId" NOT IN (${Prisma.join(
            matchedProfilesId
          )})
           `
        : Prisma.empty
    }


`) as { total: number }[];

    return total;
  }

  async getUnMatches(user: UserReq, body: PaginationReq) {
    const [{ data: matches }, applicationSettings] = await Promise.all([
      this.getMatches({ user }),
      this.prisma.applicationSettings.findFirst(),
    ]);

    if (!applicationSettings) {
      throw new InternalServerErrorException('Provide application settings');
    }

    const matchedProfilesId = matches.map((el) => el.profileId);
    const msInDay = 24 * 60 * 60 * 1000;

    const superLikeExpirationDate = new Date(
      new Date().getTime() - applicationSettings.likeExpirationDays * msInDay
    );
    const [unMatches] = await Promise.all([
      this.prisma.$queryRaw`
    SELECT
        p.id AS "profileId",
        u.name
        FROM "Profile" AS p

        LEFT JOIN "Likes" "l2" ON "l2"."profileId" = ${
          user.profile.id
        } AND "l2"."likedProfileId" = p.id AND l2."expirationDate" > ${new Date()}

LEFT JOIN "SuperLikes" "sl2" ON "sl2"."profileId" = ${
        user.profile.id
      } AND "sl2"."superLikedProfileId" = p.id AND sl2."updatedAt" > ${superLikeExpirationDate}


       LEFT JOIN "User" as u ON u.id = p."userId"

        WHERE  (l2."profileId" IS NOT NULL OR sl2."profileId" IS NOT NULL)


    ${
      matchedProfilesId.length
        ? Prisma.sql`AND "l2"."likedProfileId" NOT IN (${Prisma.join(
            matchedProfilesId
          )})
           `
        : Prisma.empty
    }
  ` as Promise<ShortProfileByIdRes[]>,
    ]);

    console.log(unMatches);

    const [result, count] = await Promise.all([
      this.prisma.$queryRaw`
    SELECT
        p.id AS "profileId",
        u.name
        FROM "Profile" AS p

        LEFT JOIN "Likes" "l2" ON "l2"."profileId" = ${
          user.profile.id
        } AND "l2"."likedProfileId" = p.id AND l2."expirationDate" > ${new Date()}


       LEFT JOIN "User" as u ON u.id = p."userId"

        WHERE  l2."profileId" IS NOT NULL

    ${
      matchedProfilesId.length
        ? Prisma.sql`AND "l2"."likedProfileId" NOT IN (${Prisma.join(
            matchedProfilesId
          )})
           `
        : Prisma.empty
    }

    ORDER BY  l2."updatedAt" DESC

    ${
      body
        ? Prisma.sql`LIMIT ${body.limit}
  OFFSET ${body.limit * (body.page - 1)}`
        : Prisma.empty
    }
  ` as Promise<ShortProfileByIdRes[]>,
      this.totalUnMatches(user, matchedProfilesId, superLikeExpirationDate),
    ]);

    const unMatchesWithPhoto = await Promise.all(
      result.map(async (el) => {
        const firstProfilePhoto = await this.prisma.userPhoto.findFirst({
          where: {
            user: {
              profile: {
                id: el.profileId,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        });

        return {
          ...el,
          avatarId: firstProfilePhoto?.id ?? null,
        };
      })
    );

    return {
      unMatches: unMatchesWithPhoto,
      total: Number(count),
    };
  }

  async superLike(superLikedProfileId: number, user: UserReq) {
    try {
      const appSettings = await this.prisma.applicationSettings.findFirst();

      if (!appSettings) {
        throw new InternalServerErrorException(
          'No expiration days constants not found'
        );
      }

      const minDislikeDate = new Date();
      minDislikeDate.setDate(
        minDislikeDate.getDate() - +appSettings.unLikeExpirationDays
      );

      const minSuperLikeDate = new Date();
      minSuperLikeDate.setDate(
        minSuperLikeDate.getDate() - +appSettings.likeExpirationDays
      );

      const msInDay = 24 * 60 * 60 * 1000;

      const superLikeExpirationDate = new Date(
        new Date().getTime() - appSettings.likeExpirationDays * msInDay
      );

      const [
        limit,
        userSubscription,
        userSuperLike,
        isMeLiked,
        isMeSuperLiked,
      ] = await Promise.all([
        this.prisma.superLikeLimits.findUnique({
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
                    name: PlanLimitName.SUPER_LIKE,
                  },
                },
              },
            },
          },
        }),
        this.prisma.superLikes.findUnique({
          where: {
            updatedAt: {
              gte: superLikeExpirationDate,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            superLikedProfileId_profileId: {
              superLikedProfileId: superLikedProfileId,
              profileId: user.profile.id,
            },
          },
        }),
        this.prisma.likes.findFirst({
          where: {
            likedProfileId: user.profile.id,
            profileId: superLikedProfileId,
            expirationDate: {
              gte: new Date(),
            },
          },
        }),
        this.prisma.superLikes.findFirst({
          where: {
            superLikedProfileId: user.profile.id,
            profileId: superLikedProfileId,
            updatedAt: {
              gte: minSuperLikeDate,
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

      const isLimitsUpdateAvailable =
        !limit || (limit.resetDate && new Date(limit.resetDate) <= new Date());
      if (!isLimitsUpdateAvailable && actionsPerPeriod === 0) {
        throw new BadRequestException('No super likes available');
      }

      if (!isLimitsUpdateAvailable && limit.remainingSuperLikes === 0) {
        throw new BadRequestException('No limits available left');
      }
      if (userSuperLike) {
        throw new BadRequestException('You already super liked this user');
      }

      const superLikeBody = {
        profileId: user.profile.id,
        superLikedProfileId: superLikedProfileId,
      };

      const superLike = await this.prisma.$transaction(async (tx) => {
        const [superLike] = await Promise.all([
          tx.superLikes.upsert({
            where: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              superLikedProfileId_profileId: superLikeBody,
            },
            create: superLikeBody,
            update: superLikeBody,
          }),

          limit &&
            !isLimitsUpdateAvailable &&
            tx.superLikeLimits.update({
              where: {
                profileId: user.profile.id,
              },
              data: {
                remainingSuperLikes: limit.remainingSuperLikes
                  ? limit.remainingSuperLikes - 1
                  : null,
              },
            }),
          isLimitsUpdateAvailable &&
            tx.superLikeLimits.upsert({
              where: { profileId: user.profile.id },
              create: {
                profileId: user.profile.id,
                remainingSuperLikes: actionsPerPeriod,
                resetDate: periodInDays ? resetDate : null,
              },
              update: {
                remainingSuperLikes: actionsPerPeriod,
                resetDate: periodInDays ? resetDate : null,
              },
            }),
        ]);

        await this.notificationsService.sendNotification(
          superLikedProfileId,
          `${capitalize(user.profile.role)} super liked your profile`,
          NotificationType.SUPER_LIKE,
          user.profile.id
        );

        await this.notificationsService.cronSendNotification(
          user.profile.id,
          DailyActions.SUPER_LIKE
        );

        if (isMeLiked || isMeSuperLiked) {
          await this.notificationsService.sendNotification(
            superLikedProfileId,
            'There’s match! Check it right now',
            NotificationType.MATCH,
            user.profile.id
          );

          await this.notificationsService.sendNotification(
            user.profile.id,
            'There’s match! Check it right now',
            NotificationType.MATCH,
            superLikedProfileId
          );
        }

        return superLike;
      });

      return superLike;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getActualUnLikes(user: UserReq) {
    const appSettings = await this.prisma.applicationSettings.findFirst();

    if (!appSettings) {
      throw new InternalServerErrorException(
        'No expiration days constants not found'
      );
    }

    const minDate = new Date();
    minDate.setDate(minDate.getDate() - +appSettings.unLikeExpirationDays);

    const unLikedProfiles = await this.prisma.unLikes.findMany({
      where: {
        profileId: user.profile.id,
        unLikeDate: {
          gte: minDate.toISOString(),
        },
      },
    });

    return unLikedProfiles;
  }

  async createUnlike(user: UserReq, unLikedProfileId: number) {
    try {
      const appSettings = await this.prisma.applicationSettings.findFirst();
      if (!appSettings) {
        throw new InternalServerErrorException('No app settings provided');
      }

      const superLikeExpireDate = new Date();
      superLikeExpireDate.setDate(
        superLikeExpireDate.getDate() - appSettings.likeExpirationDays
      );

      const [like, superLike] = await Promise.all([
        this.prisma.likes.findFirst({
          where: {
            profileId: user.profile.id,
            likedProfileId: unLikedProfileId,
            expirationDate: {
              gte: new Date(),
            },
          },
        }),
        this.prisma.superLikes.findFirst({
          where: {
            profileId: user.profile.id,
            superLikedProfileId: unLikedProfileId,
            updatedAt: { gte: superLikeExpireDate },
          },
        }),
      ]);

      if (like || superLike) {
        throw new BadRequestException('You already liked this user');
      }
      const unLike = await this.prisma.unLikes.upsert({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          unLikedProfileId_profileId: {
            profileId: user.profile.id,
            unLikedProfileId: unLikedProfileId,
          },
        },
        create: {
          profileId: user.profile.id,
          unLikedProfileId: unLikedProfileId,
          unLikeDate: new Date(),
        },
        update: {
          profileId: user.profile.id,
          unLikedProfileId: unLikedProfileId,
          unLikeDate: new Date(),
        },
      });

      return unLike;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException(
            'There is a unique constraint violation, user already unLiked'
          );
        }
      }
      throw e;
    }
  }

  async rewind(rewindProfileId: number, user: UserReq) {
    const appSettings = await this.prisma.applicationSettings.findFirst();

    if (!appSettings) {
      throw new InternalServerErrorException(
        'No expiration days constants not found'
      );
    }

    const minSuperLikeDate = new Date();
    minSuperLikeDate.setDate(
      minSuperLikeDate.getDate() - +appSettings.likeExpirationDays
    );

    const minDislikeDate = new Date();
    minDislikeDate.setDate(
      minDislikeDate.getDate() - +appSettings.unLikeExpirationDays
    );

    const [limit, userSubscription, lastLike, lastSuperLike, lastUnlike] =
      await Promise.all([
        this.prisma.rewindLimits.findUnique({
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
                    name: PlanLimitName.REWIND,
                  },
                },
              },
            },
          },
        }),
        this.prisma.likes.findUnique({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            profileId_likedProfileId: {
              profileId: user.profile.id,
              likedProfileId: rewindProfileId,
            },
            expirationDate: { gte: new Date() },
          },
          select: {
            updatedAt: true,
          },
        }),
        this.prisma.superLikes.findUnique({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            superLikedProfileId_profileId: {
              profileId: user.profile.id,
              superLikedProfileId: rewindProfileId,
            },
            updatedAt: {
              gte: minSuperLikeDate,
            },
          },
          select: {
            updatedAt: true,
          },
        }),
        this.prisma.unLikes.findUnique({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            unLikedProfileId_profileId: {
              profileId: user.profile.id,
              unLikedProfileId: rewindProfileId,
            },
            updatedAt: {
              gte: minDislikeDate,
            },
          },
          select: {
            updatedAt: true,
          },
        }),
      ]);

    function findBiggestDate(
      actionsData: { updatedAt: Date | null; actionType: ActionType }[]
    ) {
      actionsData.sort((first, second) => {
        if (
          new Date(first.updatedAt || 0).getMilliseconds() >
          new Date(second.updatedAt || 0).getMilliseconds()
        ) {
          return -1;
        } else if (
          new Date(first.updatedAt || 0).getMilliseconds() <
          new Date(second.updatedAt || 0).getMilliseconds()
        ) {
          return 1;
        }

        return 0;
      });

      return actionsData[0];
    }

    if (!userSubscription) {
      throw new BadRequestException('No account type selected');
    }

    const actionToRewind = findBiggestDate([
      { actionType: 'LIKE', updatedAt: lastLike?.updatedAt || null },
      { actionType: 'SUPER_LIKE', updatedAt: lastSuperLike?.updatedAt || null },
      { actionType: 'UNLIKE', updatedAt: lastUnlike?.updatedAt || null },
    ]);

    if (actionToRewind.updatedAt === null) {
      throw new BadRequestException('You have no action to rewind');
    }

    const actionsPerPeriod = userSubscription.plan.planLimits[0].limit;
    const periodInDays = userSubscription.plan.planLimits[0].days;

    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + (periodInDays || 0));
    const body = {
      profileId: user.profile.id,
      remainingRewinds: actionsPerPeriod,
      resetDate: periodInDays ? resetDate : null,
    };

    if (
      !limit ||
      (limit.resetDate && new Date(limit.resetDate) <= new Date())
    ) {
      await this.prisma.rewindLimits.upsert({
        where: { profileId: user.profile.id },
        create: body,
        update: body,
      });
    }

    const currentLimit = await this.prisma.rewindLimits.findUnique({
      where: {
        profileId: user.profile.id,
      },
    });

    if (!currentLimit || currentLimit.remainingRewinds === 0) {
      throw new ForbiddenException('You have used all your rewinds available');
    }

    const rewind = await this.prisma.$transaction(async (tx) => {
      const rewindRow = await tx.rewinds.create({
        data: {
          rewoundProfileId: rewindProfileId,
          profileId: user.profile.id,
          actionType: actionToRewind.actionType,
        },
        select: {
          rewoundProfileId: true,
          profileId: true,
          actionType: true,
          id: true,
        },
      });

      if (actionToRewind.actionType === ActionType.LIKE) {
        await tx.likes.delete({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            profileId_likedProfileId: {
              likedProfileId: rewindProfileId,
              profileId: user.profile.id,
            },
          },
        });
      } else if (actionToRewind.actionType === ActionType.SUPER_LIKE) {
        await tx.superLikes.delete({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            superLikedProfileId_profileId: {
              superLikedProfileId: rewindProfileId,
              profileId: user.profile.id,
            },
          },
        });
      } else if (actionToRewind.actionType === ActionType.UNLIKE) {
        await tx.unLikes.delete({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            unLikedProfileId_profileId: {
              profileId: user.profile.id,
              unLikedProfileId: rewindProfileId,
            },
          },
        });
      } else {
        throw new BadRequestException('Action type to rewind not found');
      }

      await tx.rewindLimits.update({
        where: {
          profileId: user.profile.id,
        },
        data: {
          remainingRewinds: currentLimit.remainingRewinds
            ? currentLimit.remainingRewinds - 1
            : null,
        },
      });

      await this.notificationsService.cronSendNotification(
        user.profile.id,
        DailyActions.REWIND
      );

      return rewindRow;
    });

    return rewind;
  }

  async totalLikedMe(
    user: UserReq,
    superLikeExpirationDate: Date,
    minDate?: Date
  ) {
    const result = (await this.prisma.$queryRaw`
    SELECT
    COUNT(p.id) AS "total"
    FROM "Profile" AS p
    LEFT JOIN "Likes" AS l1 ON  l1."likedProfileId" = ${
      user.profile.id
    } AND l1."profileId" = "p".id AND "l1"."expirationDate" > ${new Date()}
     LEFT JOIN "SuperLikes" AS sl ON  sl."superLikedProfileId" = ${
       user.profile.id
     } AND sl."profileId" = "p".id AND "sl"."updatedAt" > ${superLikeExpirationDate}

    LEFT JOIN "User" as u ON p."userId" = u.id
    WHERE (l1.id IS NOT NULL OR sl.id IS NOT NULL)
    ${
      minDate
        ? Prisma.sql`AND l1."updatedAt" > ${minDate} OR sl."updatedAt" > ${minDate} `
        : Prisma.empty
    }



  `) as { total: number }[];

    return result;
  }

  async getLikedMe(
    user: UserReq,
    body: {
      pagination?: PaginationReq;
      minDate?: Date;
    }
  ) {
    const appSettings = await this.prisma.applicationSettings.findFirst();
    if (!appSettings) {
      throw new BadRequestException('No app settings found');
    }

    const msInDay = 24 * 60 * 60 * 1000;
    const superLikeExpirationDate = new Date(
      new Date().getTime() - appSettings.likeExpirationDays * msInDay
    );

    const [count, data] = await Promise.all([
      this.totalLikedMe(user, superLikeExpirationDate, body.minDate),
      this.prisma.$queryRaw`
      SELECT
      p.id AS "profileId",

      u.name, sl."superLikedProfileId"
      FROM "Profile" AS p
      LEFT JOIN "Likes" AS l1 ON  l1."likedProfileId" = ${
        user.profile.id
      } AND l1."profileId" = "p".id AND "l1"."expirationDate" > ${new Date()}
       LEFT JOIN "SuperLikes" AS sl ON  sl."superLikedProfileId" = ${
         user.profile.id
       } AND sl."profileId" = "p".id AND "sl"."updatedAt" > ${superLikeExpirationDate}

      LEFT JOIN "User" as u ON p."userId" = u.id
      WHERE (l1.id IS NOT NULL OR sl.id IS NOT NULL)
      ${
        body.minDate
          ? Prisma.sql`AND l1."updatedAt" > ${body.minDate} OR sl."updatedAt" > ${body.minDate} `
          : Prisma.empty
      }

      GROUP BY p.id, u.id, sl.id, l1.id

      ORDER BY (
        CASE
          WHEN sl."updatedAt" IS NOT NULL AND l1."updatedAt" IS NOT NULL THEN
            CASE
              WHEN l1."updatedAt" > sl."updatedAt" THEN l1."updatedAt"
              ELSE sl."updatedAt"
            END
          WHEN sl."updatedAt" IS NOT NULL THEN sl."updatedAt"
          ELSE l1."updatedAt"
        END) DESC

      ${
        body.pagination
          ? Prisma.sql`LIMIT ${body.pagination.limit}
    OFFSET ${body.pagination.limit * (body.pagination.page - 1)}`
          : Prisma.empty
      }

    ` as Promise<
        {
          superLikedProfileId: number;
          profileId: number;
          name: string;
        }[]
      >,
    ]);

    const likedMeWithPhoto = await Promise.all(
      data.map(async (el) => {
        const firstProfilePhoto = await this.prisma.userPhoto.findFirst({
          where: {
            user: {
              profile: {
                id: el.profileId,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        });

        return {
          ...el,
          avatarId: firstProfilePhoto?.id ?? null,
        };
      })
    );

    return {
      data: likedMeWithPhoto,
      total: count.length ? Number(count[0].total) : 0,
    };
  }
}
