import {
  AdminGetUserRes,
  UserReq,
  UserSettingsReq,
  UserSettingsRes,
} from '@app/common/dto';
import { MailService } from '@app/common/mail';
import { PrismaService } from '@app/common/prisma';
import { GoogleMapsService } from '@app/components/google-maps';
import { cryptoHelper } from '@app/core/utils';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlanName } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private googleMapsService: GoogleMapsService
  ) {}

  async patchUserSettings(userId: number, userSettingsData: UserSettingsReq) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, profile: { select: { id: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let locationPreferenceData:
      | {
          city: null | string;
          country: null | string;
        }
      | null
      | undefined = {
      city: null,
      country: null,
    };

    if (
      userSettingsData.discovery?.latPreference &&
      userSettingsData.discovery.lngPreference
    ) {
      locationPreferenceData =
        await this.googleMapsService.getLocationFromCoords(
          userSettingsData.discovery.latPreference,
          userSettingsData.discovery.lngPreference
        );
    } else if (
      userSettingsData.discovery?.latPreference === null &&
      userSettingsData.discovery.lngPreference === null
    ) {
      locationPreferenceData = null;
    } else {
      locationPreferenceData = undefined;
    }

    await this.prisma.$transaction(async (tx) => {
      if (!user.profile) {
        throw new BadRequestException('User has no profile');
      }

      if (typeof userSettingsData.email !== 'undefined') {
        if (
          await tx.user.findUnique({
            where: { email: userSettingsData.email },
          })
        ) {
          throw new BadRequestException('This email is already used');
        }
      }

      if (
        typeof userSettingsData.discovery?.distancePreference !== 'undefined'
      ) {
        const plan = await this.prisma.userSubscription.findUnique({
          where: { userId: user.id },
          select: {
            plan: {
              select: {
                planName: true,
              },
            },
          },
        });

        if (!plan) {
          throw new BadRequestException('No plan chosen');
        }

        if (
          plan.plan.planName !== PlanName.PREMIUM &&
          userSettingsData.discovery.distancePreference > 50
        ) {
          throw new BadRequestException(
            'Maximum radius for non-premium users is 50 km'
          );
        }

        if (userSettingsData.discovery.distancePreference > 5000) {
          throw new BadRequestException(
            'Maximum radius for premium users is 5000 km'
          );
        }
      }

      if (locationPreferenceData) {
        const plan = await this.prisma.userSubscription.findUnique({
          where: { userId: user.id },
          select: {
            plan: {
              select: {
                planName: true,
              },
            },
          },
        });

        if (!plan) {
          throw new BadRequestException('No plan chosen');
        }

        if (plan.plan.planName !== PlanName.PREMIUM) {
          throw new BadRequestException(
            'Only premium users can select preffered country and city'
          );
        }
      }

      if (userSettingsData.discovery?.location) {
        const locationData = await this.googleMapsService.getLocationFromCoords(
          userSettingsData.discovery.location.lat,
          userSettingsData.discovery.location.lng
        );

        await this.prisma.profile.update({
          where: { id: user.profile.id },
          data: {
            city: locationData?.city ?? undefined,
            country: locationData?.country ?? undefined,
          },
        });
      }

      const password =
        typeof userSettingsData.password !== 'undefined'
          ? await hash(userSettingsData.password, 10)
          : undefined;

      await tx.user.update({
        where: { id: user.id },
        data: {
          password,
        },
      });

      await tx.profileSettings.update({
        where: { profileId: user.profile.id },
        data: {
          distancePreference: userSettingsData.discovery?.distancePreference,
          pushOnLikes: userSettingsData.notifications?.push?.pushOnLikes,
          pushOnAppNews: userSettingsData.notifications?.push?.pushOnAppNews,
          pushOnNewMatch: userSettingsData.notifications?.push?.pushOnNewMatch,
          pushOnNewMessage:
            userSettingsData.notifications?.push?.pushOnNewMessage,
          pushOnAddedToFavorites:
            userSettingsData.notifications?.push?.pushOnAddedToFavorites,
          emailNotificationsRecieveType:
            userSettingsData.notifications?.email
              ?.emailNotificationsRecieveType,
          countryPreference:
            locationPreferenceData && locationPreferenceData.country,
          cityPreference: locationPreferenceData && locationPreferenceData.city,
          lat: userSettingsData.discovery?.location?.lat,
          lng: userSettingsData.discovery?.location?.lng,
          isLocationAuto: userSettingsData.discovery?.location?.isLocationAuto,
          isLocationPreferenceAuto: userSettingsData.discovery
            ?.distancePreference
            ? true
            : locationPreferenceData
            ? false
            : locationPreferenceData === null
            ? true
            : undefined,
        },
      });

      if (typeof userSettingsData.email !== 'undefined') {
        await tx.emailVerificationCode.deleteMany({
          where: { userId: user.id },
        });

        const verificationCode = cryptoHelper.generateCode(5);

        await tx.emailVerificationCode.create({
          data: {
            email: userSettingsData.email,
            verificationCode,
            userId: user.id,
          },
        });

        await this.mailService.sendEmailVerificationCode(
          userSettingsData.email,
          verificationCode
        );
      }
    });
  }

  async getSettings(user: UserReq): Promise<UserSettingsRes> {
    const profileSettings = await this.prisma.profileSettings.findUnique({
      where: { profileId: user.profile.id },
    });

    if (!profileSettings) {
      throw new BadRequestException('User has no profile');
    }

    return {
      discovery: {
        distancePreference: profileSettings.distancePreference,
        location: {
          lat: profileSettings.lat,
          lng: profileSettings.lng,
          isLocationAuto: profileSettings.isLocationAuto,
        },
        cityPreference: profileSettings.cityPreference,
        countryPreference: profileSettings.countryPreference,
        isLocationPreferenceAuto: profileSettings.isLocationPreferenceAuto,
      },
      notifications: {
        email: {
          emailNotificationsRecieveType:
            profileSettings.emailNotificationsRecieveType,
        },

        push: {
          pushOnLikes: profileSettings.pushOnLikes,
          pushOnAppNews: profileSettings.pushOnAppNews,
          pushOnNewMatch: profileSettings.pushOnNewMatch,
          pushOnNewMessage: profileSettings.pushOnNewMessage,
          pushOnAddedToFavorites: profileSettings.pushOnAddedToFavorites,
        },
      },
    };
  }

  updateRegistrationToken(id: number, registrationToken: string) {
    return this.prisma.profile.update({
      where: { userId: id },
      data: { registrationToken },
    });
  }

  async getUserInfo(id: number) {
    const userData = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
        name: true,
        phoneNumber: true,
        isPhoneVerified: true,
        isEmailVerified: true,
        userPhoto: { select: { id: true } },
        profile: {
          select: {
            id: true,
            isLookingForArtist: true,
            isLookingForCollector: true,
            isLookingForGallery: true,
          },
        },
      },
    });

    if (!userData) {
      throw new NotFoundException('No user found');
    }

    const { profile, userPhoto, ...restUserData } = userData;

    return {
      ...restUserData,
      steps: {
        isLookingForCompleted: profile
          ? profile.isLookingForArtist ||
            profile.isLookingForCollector ||
            profile.isLookingForGallery
          : false,
        isPhotosLoaded: userPhoto.length ? true : false,
        isProfileCompleted: profile ? true : false,
      },
    };
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new NotFoundException("User with this id doesn't exist");
    }

    await this.prisma.user.delete({ where: { id } });

    await this.mailService.sendAccountDeleted(user.email, user.name);
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        userSubscription: {
          select: { plan: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User with this id doesn't exist");
    }

    const profile = await this.getProfileDataByUserId(id);

    const userPhotos = await this.prisma.userPhoto.findMany({
      where: { userId: id },
      select: { id: true, order: true },
      orderBy: { order: 'asc' },
    });

    const res = {
      id: user.id,
      name: user.name,
      email: user.email,
      city: profile?.city ?? undefined,
      country: profile?.country ?? undefined,
      gender: profile?.gender ?? undefined,
      profileDescription: profile?.profileDescription ?? undefined,
      plan: user.userSubscription?.plan.planName ?? undefined,
      isLookingForArtist: profile?.isLookingForArtist,
      isLookingForGallery: profile?.isLookingForGallery,
      isLookingForCollector: profile?.isLookingForCollector,
      role: profile?.role ?? undefined,
      age: profile?.age ?? undefined,
      userPhotos: userPhotos,
    };

    return { user: res };
  }
  async getAllUsers({
    take,
    page,
    search,
    isSearchPayments,
  }: {
    take?: number;
    page?: number;
    search?: string;
    isSearchPayments?: boolean;
  }) {
    const users = await this.prisma.user.findMany({
      where: {
        role: 'USER',
        stripeCustomerId: isSearchPayments ? { not: null } : undefined,
        OR: search
          ? [
              {
                name: isSearchPayments
                  ? { contains: search, mode: 'insensitive' }
                  : undefined,
              },
              { email: { contains: search, mode: 'insensitive' } },
              { profile: { city: { contains: search, mode: 'insensitive' } } },
              {
                profile: { country: { contains: search, mode: 'insensitive' } },
              },
            ]
          : undefined,
      },
      skip: page && take ? (page - 1) * take : undefined,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        stripeCustomerId: true,
        userSubscription: {
          select: { plan: true },
        },
      },
    });

    const res: AdminGetUserRes[] = [];

    for (const user of users) {
      const profile = await this.getProfileDataByUserId(user.id);

      res.push({
        id: user.id,
        name: user.name,
        email: user.email,
        city: profile?.city ?? undefined,
        country: profile?.country ?? undefined,
        role: profile?.role,
        stripeCustomerId: user.stripeCustomerId ?? undefined,
        gender: profile?.gender ?? undefined,
        profileDescription: profile?.profileDescription ?? undefined,
        plan: user.userSubscription?.plan.planName ?? undefined,
        isLookingForArtist: profile?.isLookingForArtist,
        isLookingForGallery: profile?.isLookingForGallery,
        isLookingForCollector: profile?.isLookingForCollector,
      });
    }

    const totalUsers = await this.prisma.user.count();

    return { users: res, pages: take ? Math.ceil(totalUsers / take) : 1 };
  }

  async getProfileDataByUserId(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        city: true,
        country: true,
        gender: true,
        profileDescription: true,
        isLookingForArtist: true,
        isLookingForGallery: true,
        isLookingForCollector: true,
        role: true,
        age: true,
      },
    });

    return profile;
  }

  async isPremium(id: number) {
    const user = await this.prisma.userSubscription.findUnique({
      where: { userId: id },
      select: {
        plan: {
          select: {
            planName: true,
          },
        },
      },
    });

    return { isPremium: user?.plan.planName === PlanName.PREMIUM };
  }
}
