import { MailService } from '@app/common/mail';
import { PrismaService } from '@app/common/prisma';
import { ProfileService } from '@app/components/profile';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PlanName,
  Prisma,
  StripeSubscriptionStatus,
  UserRole,
} from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private profileService: ProfileService,
    private mailService: MailService
  ) {}

  async grantPremium(id: number, wasPaid: boolean, amountDays?: number) {
    const premiumPlan = await this.prisma.premiumPlan.findUnique({
      where: { planName: PlanName.PREMIUM },
      select: { id: true },
    });
    if (!premiumPlan) {
      throw new InternalServerErrorException('Premium plan not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { profile: { select: { id: true } }, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.profile) {
      await this.prisma.userSubscription.create({
        data: {
          endDate: amountDays
            ? new Date(Date.now() + amountDays * 24 * 60 * 60 * 1000)
            : null,
          userId: id,
          planId: premiumPlan.id,
          wasPaid,
        },
      });

      return;
    } else {
      const currentUserSubscription =
        await this.prisma.userSubscription.findUnique({
          where: { userId: id },
        });
      if (!currentUserSubscription) {
        throw new InternalServerErrorException('User has no subscription');
      }

      const [_, subscription] = await this.prisma.$transaction([
        this.prisma.userSubscription.delete({
          where: { id: currentUserSubscription.id },
        }),
        this.prisma.userSubscription.create({
          data: {
            endDate: amountDays
              ? new Date(Date.now() + amountDays * 24 * 60 * 60 * 1000)
              : null,
            userId: id,
            planId: premiumPlan.id,
            wasPaid,
          },
          select: {
            plan: {
              select: {
                planLimits: {
                  select: {
                    name: true,
                    limit: true,
                    days: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      await this.profileService.updateProfilesLimits(
        [user.profile.id],
        subscription.plan.planLimits
      );
    }

    if (!wasPaid) {
      void this.mailService.sendGiftPremiumMail(
        user.name,
        amountDays
          ? new Date(Date.now() + amountDays * 24 * 60 * 60 * 1000)
          : new Date(),
        user.email
      );
    }
  }

  async revokePremium(id: number, isEmittedByStripe = false) {
    const standardPlan = await this.prisma.premiumPlan.findUnique({
      where: { planName: PlanName.STANDARD },
      select: { id: true },
    });
    if (!standardPlan) {
      throw new InternalServerErrorException('Standard plan not found');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId: id },
      select: {
        id: true,
        profileClassifications: true,
        profileGalleryTypes: true,
        profileArtOrientations: true,
        role: true,
      },
    });
    if (!profile) {
      throw new InternalServerErrorException('User has no profile');
    }

    const currentUserSubscription =
      await this.prisma.userSubscription.findUnique({ where: { userId: id } });
    if (!currentUserSubscription) {
      throw new InternalServerErrorException('User has no subscription');
    }

    if (currentUserSubscription.wasPaid === true && !isEmittedByStripe) {
      throw new ForbiddenException('User subscription was paid');
    }

    const [_, subscription] = await this.prisma.$transaction([
      this.prisma.userSubscription.delete({
        where: { id: currentUserSubscription.id },
      }),
      this.prisma.userSubscription.create({
        data: {
          endDate: null,
          userId: id,
          planId: standardPlan.id,
          wasPaid: false,
        },
        select: {
          plan: {
            select: {
              planLimits: {
                select: {
                  name: true,
                  limit: true,
                  days: true,
                },
              },
            },
          },
        },
      }),
    ]);

    await this.profileService.updateProfilesLimits(
      [profile.id],
      subscription.plan.planLimits
    );

    const applicationSettings = await this.prisma.applicationSettings.findFirst(
      {
        select: { classificationsLimits: true },
      }
    );

    if (!applicationSettings || !applicationSettings.classificationsLimits) {
      throw new InternalServerErrorException('Application settings not found');
    }

    await this.prisma.profileSettings.update({
      where: { profileId: profile.id },
      data: {
        isLocationAuto: true,
        isLocationPreferenceAuto: true,
      },
    });

    switch (profile.role) {
      case UserRole.ARTIST:
        await this.prisma.profile.update({
          where: { id: profile.id },
          data: {
            isLookingForArtist: false,
            isLookingForGallery: true,
            isLookingForCollector: false,
          },
        });
        break;

      case UserRole.GALLERY:
        await this.prisma.profile.update({
          where: { id: profile.id },
          data: {
            isLookingForArtist: true,
            isLookingForGallery: false,
            isLookingForCollector: false,
          },
        });
        break;

      case UserRole.COLLECTOR:
        await this.prisma.profile.update({
          where: { id: profile.id },
          data: {
            isLookingForArtist: true,
            isLookingForGallery: false,
            isLookingForCollector: false,
          },
        });
        break;
    }

    await this.prisma
      .$queryRaw`DELETE FROM "ProfileClassifications" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "ProfileClassifications" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "ProfileArtOrientations" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "ProfileArtOrientations" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "ProfileGalleryTypes" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "ProfileGalleryTypes" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "ArtistClassificationFilter" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "ArtistClassificationFilter" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "GalleryClassificationFilter" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "GalleryClassificationFilter" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "GalleryTypeFilter" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "GalleryTypeFilter" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "Orientation" WHERE "profileId" = ${profile.id}
      AND id NOT IN (
      SELECT id FROM "Orientation" WHERE "profileId" = ${profile.id}
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async revokeExpiredSubscriptions() {
    const standardPlan = await this.prisma.premiumPlan.findUnique({
      where: { planName: PlanName.STANDARD },
      select: { id: true, planLimits: true },
    });
    if (!standardPlan) {
      throw new InternalServerErrorException('Standard plan not found');
    }

    const expiredSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        endDate: {
          lte: new Date(),
        },
      },
      select: {
        userId: true,
      },
    });

    await this.prisma.userSubscription.deleteMany({
      where: {
        userId: {
          in: expiredSubscriptions.map((subscription) => subscription.userId),
        },
      },
    });

    await this.prisma.userSubscription.createMany({
      data: expiredSubscriptions.map((subscription) => ({
        endDate: null,
        userId: subscription.userId,
        planId: standardPlan.id,
        wasPaid: false,
      })),
    });

    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: {
          in: expiredSubscriptions.map((subscription) => subscription.userId),
        },
      },
      select: { id: true, user: { select: { email: true, name: true } } },
    });

    const profilesIds = profiles.map((profile) => profile.id);

    if (profilesIds.length === 0) {
      return;
    }

    await this.profileService.updateProfilesLimits(
      profilesIds,
      standardPlan.planLimits
    );

    const applicationSettings = await this.prisma.applicationSettings.findFirst(
      {
        select: { classificationsLimits: true },
      }
    );

    if (!applicationSettings || !applicationSettings.classificationsLimits) {
      throw new InternalServerErrorException('Application settings not found');
    }

    await this.prisma
      .$queryRaw`DELETE FROM "ProfileClassifications" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "ProfileClassifications" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "ProfileArtOrientations" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "ProfileArtOrientations" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "ProfileGalleryTypes" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "ProfileGalleryTypes" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "ArtistClassificationFilter" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "ArtistClassificationFilter" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "GalleryClassificationFilter" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "GalleryClassificationFilter" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "GalleryTypeFilter" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "GalleryTypeFilter" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma
      .$queryRaw`DELETE FROM "Orientation" WHERE "profileId" IN (${Prisma.join(
      profilesIds
    )})
      AND id NOT IN (
      SELECT id FROM "Orientation" WHERE "profileId" IN (${Prisma.join(
        profilesIds
      )})
      ORDER BY id
      LIMIT ${applicationSettings.classificationsLimits}
      )`;

    await this.prisma.profileSettings.updateMany({
      where: {
        profileId: {
          in: profilesIds,
        },
      },
      data: {
        isLocationAuto: true,
        isLocationPreferenceAuto: true,
      },
    });

    await this.prisma.profile.updateMany({
      where: {
        AND: [
          {
            id: {
              in: profilesIds,
            },
            role: UserRole.ARTIST,
          },
        ],
      },
      data: {
        isLookingForArtist: false,
        isLookingForGallery: true,
        isLookingForCollector: false,
      },
    });

    await this.prisma.profile.updateMany({
      where: {
        AND: [
          {
            id: {
              in: profilesIds,
            },
            role: UserRole.GALLERY,
          },
        ],
      },
      data: {
        isLookingForArtist: true,
        isLookingForGallery: false,
        isLookingForCollector: false,
      },
    });

    await this.prisma.profile.updateMany({
      where: {
        AND: [
          {
            id: {
              in: profilesIds,
            },
            role: UserRole.COLLECTOR,
          },
        ],
      },
      data: {
        isLookingForArtist: true,
        isLookingForGallery: false,
        isLookingForCollector: false,
      },
    });

    Promise.all([
      profiles.map((el) =>
        this.mailService.sendExpirePremiumMail(el.user.name, el.user.email)
      ),
    ]);
  }

  async createSubscription(userId: number, stripeSubscriptionId: string) {
    await this.prisma.stripeSubscription.create({
      data: {
        userId,
        stripeSubscriptionId,
      },
    });
  }

  async updateSubscription(
    stripeSubscriptionId: string,
    status: StripeSubscriptionStatus
  ) {
    await this.prisma.stripeSubscription.update({
      where: { stripeSubscriptionId },
      data: { status },
    });
  }

  async getSubscriptionStatus(stripeSubscriptionId: string) {
    const subscription = await this.prisma.stripeSubscription.findUnique({
      where: { stripeSubscriptionId },
      select: { status: true },
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return { subscriptionStatus: subscription.status };
  }

  async getCurrentSubscription(userId: number) {
    try {
      const currentUserSubscription =
        await this.prisma.userSubscription.findUnique({
          where: { userId },
          select: {
            endDate: true,
            wasPaid: true,
            plan: { select: { planName: true } },
          },
        });

      return currentUserSubscription;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    }
  }
}
