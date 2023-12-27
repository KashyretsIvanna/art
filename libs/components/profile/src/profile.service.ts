import {
  ArtistProfileReq,
  CollectorProfileReq,
  EditProfileReq,
  GalleryProfileReq,
  IdRes,
  PaginationReq,
  ProfileLookingForReq,
  ShortProfileByIdRes,
  ShortProfilePhotoPhotoRes,
  UserByIdData,
  UserReq,
} from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import { appleUserName } from '@app/common/types';
import { FilesService } from '@app/components/files';
import { LikesService } from '@app/components/likes';
import {
  CLASSIFICATIONS_FOR_GALLERIES,
  CLASSIFICATION_COMMON,
  CLASSIFICATION_FOR_PAINTER,
  STANDARD_PLAN,
  PREMIUM_PLAN,
} from '@app/prisma';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  PlanLimitName,
  PlanName,
  Prisma,
  PrismaClient,
  PrismaPromise,
  ProfileSettings,
  UserRole,
} from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions,
} from '@prisma/client/runtime/library';
import { Cache } from 'cache-manager';
import { Multer } from 'multer';

import { CheckProfileHelper } from './lib/check-profile.helper';
import { HandleProfileErrorHelper } from './lib/handle-profile-error.helper';
import { ProfileProgressHelper } from './lib/profile-progress.helper';

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private checkProfileHelper: CheckProfileHelper,
    private handleErrorHelper: HandleProfileErrorHelper,
    private likesService: LikesService,
    private filesService: FilesService,
    private profileProgressHelper: ProfileProgressHelper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getProfileByUserId(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfilesByProfileIds(profileIds: number[]) {
    const profiles = await this.prisma.profile.findMany({
      where: {
        id: { in: profileIds },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (profileIds.length !== profiles.length) {
      throw new BadRequestException('Wrong profile specified');
    }

    return profiles;
  }

  async editProfile(user: UserReq, body: EditProfileReq) {
    try {
      const {
        profileClassifications,
        name,
        age,
        gender,
        galleryName,
        profileDescription,
      } = body;

      if (user.profile.role === UserRole.COLLECTOR && profileClassifications) {
        throw new BadRequestException(
          'profileClassifications should not exist'
        );
      }

      if (
        user.profile.role === UserRole.ARTIST &&
        profileClassifications &&
        (profileClassifications.galleryTypes ||
          profileClassifications.orientations)
      ) {
        throw new BadRequestException(
          'galleryTypes and orientations should not exist'
        );
      }

      const availableClassifications =
        user.profile.role === UserRole.GALLERY
          ? [...CLASSIFICATION_COMMON, ...CLASSIFICATIONS_FOR_GALLERIES]
          : [...CLASSIFICATION_FOR_PAINTER, ...CLASSIFICATION_COMMON];

      await Promise.all([
        profileClassifications?.classifications &&
          this.checkProfileHelper.checkClassifications(
            profileClassifications.classifications,
            availableClassifications
          ),
        profileClassifications &&
          this.checkClassificationLimits(
            [
              profileClassifications.classifications,
              profileClassifications.orientations,
              profileClassifications.galleryTypes,
            ],
            user
          ),
      ]);

      await this.prisma.$transaction(async (tx) => {
        const deleteClassifications = profileClassifications
          ? [
              profileClassifications.classifications &&
                tx.profileClassifications.deleteMany({
                  where: {
                    profileId: user.profile.id,
                  },
                }),
              profileClassifications.galleryTypes &&
                tx.profileGalleryTypes.deleteMany({
                  where: {
                    profileId: user.profile.id,
                  },
                }),
              profileClassifications.orientations &&
                tx.profileArtOrientations.deleteMany({
                  where: {
                    profileId: user.profile.id,
                  },
                }),
            ]
          : [];

        await Promise.all(
          deleteClassifications.filter((el) => typeof el !== 'boolean')
        );

        const newProfileClassifications = profileClassifications
          ? [
              profileClassifications.classifications &&
                tx.profileClassifications.createMany({
                  data: profileClassifications.classifications.map((el) => ({
                    profileId: user.profile.id,
                    classificationId: el,
                  })),
                }),
              profileClassifications.galleryTypes &&
                tx.profileGalleryTypes.createMany({
                  data: profileClassifications.galleryTypes.map((el) => ({
                    profileId: user.profile.id,
                    typeId: el,
                  })),
                }),
              profileClassifications.orientations &&
                tx.profileArtOrientations.createMany({
                  data: profileClassifications.orientations.map((el) => ({
                    profileId: user.profile.id,
                    orientationId: el,
                  })),
                }),
            ]
          : [];

        const updatePromises = [
          tx.profile.update({
            where: { id: user.profile.id },
            data: {
              age: age ?? undefined,
              gender: gender ?? undefined,
              profileDescription: profileDescription ?? undefined,
              galleryName: galleryName ?? undefined,
            },
          }),
          name &&
            tx.user.update({
              where: { id: user.id },
              data: {
                name,
              },
            }),
          ...newProfileClassifications,
        ];

        await Promise.all(
          updatePromises.filter((el) => typeof el !== 'boolean')
        );
      });
    } catch (err) {
      this.handleErrorHelper.handleProfileClassificationsError(err);

      throw err;
    }
  }

  async getClassificationsFilters(profileId: number) {
    const [
      artistClassificationFilter,
      galleryClassificationsFilter,
      galleryTypeFilter,
      orientationFilter,
    ] = await Promise.all([
      this.prisma.artistClassificationFilter.findFirst({
        where: { profileId: profileId },
      }),
      this.prisma.galleryClassificationFilter.findFirst({
        where: { profileId: profileId },
      }),
      this.prisma.galleryTypeFilter.findFirst({
        where: { profileId: profileId },
      }),
      this.prisma.orientation.findFirst({
        where: { profileId: profileId },
      }),
    ]);

    return {
      artistClassificationFilter,
      galleryClassificationsFilter,
      galleryTypeFilter,
      orientationFilter,
    };
  }

  async getClassificationsFiltersAll(profileId: number) {
    const [
      artistClassificationFilter,
      galleryClassificationsFilter,
      galleryTypeFilter,
      orientationFilter,
    ] = await Promise.all([
      this.prisma.artistClassificationFilter.findMany({
        where: { profileId: profileId },
      }),
      this.prisma.galleryClassificationFilter.findMany({
        where: { profileId: profileId },
      }),
      this.prisma.galleryTypeFilter.findMany({
        where: { profileId: profileId },
      }),
      this.prisma.orientation.findMany({
        where: { profileId: profileId },
      }),
    ]);

    return {
      artistClassificationFilter,
      galleryClassificationsFilter,
      galleryTypeFilter,
      orientationFilter,
    };
  }

  async getLookingFor(user: UserReq) {
    const filters = await this.getClassificationsFiltersAll(user.profile.id);

    return {
      preferences: {
        isLookingForArtist: user.profile.isLookingForArtist,
        isLookingForCollector: user.profile.isLookingForCollector,
        isLookingForGallery: user.profile.isLookingForGallery,
      },
      filters: {
        galleryClassifications: filters.galleryClassificationsFilter.map(
          (el) => el.classificationId
        ),
        galleryTypes: filters.galleryTypeFilter.map((el) => el.galleryTypeId),
        orientations: filters.orientationFilter.map(
          (el) => el.artOrientationsId
        ),
        artistClassifications: filters.artistClassificationFilter.map(
          (el) => el.classificationId
        ),
      },
    };
  }

  async setLookingFor(body: ProfileLookingForReq, user: UserReq) {
    try {
      const prevFilters = await this.getClassificationsFilters(user.profile.id);

      const {
        artistClassifications,
        galleryClassifications,
        galleryTypes,
        orientations,
      } = body.filters;
      const userRole = user.profile.role;
      const newPreferences = body.preferences;

      const { isLookingForArtist, isLookingForCollector, isLookingForGallery } =
        {
          isLookingForGallery:
            typeof newPreferences.isLookingForGallery === 'boolean'
              ? newPreferences.isLookingForGallery
              : user.profile.isLookingForGallery,
          isLookingForCollector:
            typeof newPreferences.isLookingForCollector === 'boolean'
              ? newPreferences.isLookingForCollector
              : user.profile.isLookingForCollector,
          isLookingForArtist:
            typeof newPreferences.isLookingForArtist === 'boolean'
              ? newPreferences.isLookingForArtist
              : user.profile.isLookingForArtist,
        };

      const isGalleryFiltersSet =
        (galleryClassifications
          ? galleryClassifications.length
          : prevFilters.galleryClassificationsFilter) &&
        (galleryTypes ? galleryTypes.length : prevFilters.galleryTypeFilter) &&
        (orientations ? orientations.length : prevFilters.orientationFilter);

      const isArtistFiltersSet = artistClassifications
        ? artistClassifications.length
        : prevFilters.artistClassificationFilter;

      if (
        (isLookingForArtist && !isArtistFiltersSet) ||
        (isLookingForGallery && !isGalleryFiltersSet)
      ) {
        throw new BadRequestException('Choose at least 1 item!');
      }

      if (
        Object.values({
          isLookingForArtist,
          isLookingForCollector,
          isLookingForGallery,
        }).every((el) => el === false)
      ) {
        throw new BadRequestException(
          'You should set at least one profile looking for'
        );
      }

      switch (userRole) {
        case UserRole.COLLECTOR:
          if (
            (!user.isPremium && isLookingForGallery === true) ||
            isLookingForCollector
          ) {
            throw new ForbiddenException(
              'You can not set looking for gallery if you have no premium, collector is not allowed to set looking for collector'
            );
          }
          break;
        case UserRole.GALLERY:
          if (!user.isPremium && isLookingForCollector === true) {
            throw new ForbiddenException(
              'You can not set looking for collector as you have no premium'
            );
          }
          break;
        case UserRole.ARTIST:
          if (!user.isPremium && isLookingForCollector === true) {
            throw new ForbiddenException(
              'You can not set looking for collector as you have no premium'
            );
          }
          break;
        default:
          throw new InternalServerErrorException(
            `How did you get ${user.profile.role} role?`
          );
      }

      await Promise.all([
        artistClassifications?.length &&
          this.checkProfileHelper.checkClassifications(artistClassifications, [
            ...CLASSIFICATION_FOR_PAINTER,
            ...CLASSIFICATION_COMMON,
          ]),
        galleryClassifications?.length &&
          this.checkProfileHelper.checkClassifications(galleryClassifications, [
            ...CLASSIFICATIONS_FOR_GALLERIES,
            ...CLASSIFICATION_COMMON,
          ]),
        this.checkClassificationLimits(
          [
            artistClassifications,
            galleryClassifications,
            orientations,
            galleryTypes,
          ],
          user
        ),
      ]);

      await this.prisma.$transaction(async (tx) => {
        const deletePromises = [
          artistClassifications &&
            tx.artistClassificationFilter.deleteMany({
              where: {
                profileId: user.profile.id,
              },
            }),

          galleryClassifications &&
            tx.galleryClassificationFilter.deleteMany({
              where: {
                profileId: user.profile.id,
              },
            }),
          galleryTypes &&
            tx.galleryTypeFilter.deleteMany({
              where: {
                profileId: user.profile.id,
              },
            }),
          orientations &&
            tx.orientation.deleteMany({
              where: {
                profileId: user.profile.id,
              },
            }),
        ];

        await Promise.all(deletePromises);

        const artistPreferencesUpdate = [
          artistClassifications &&
            tx.artistClassificationFilter.createMany({
              data: artistClassifications.map((el) => ({
                profileId: user.profile.id,
                classificationId: el,
              })),
            }),
        ];

        const galleryPromisesUpdate = [
          galleryClassifications &&
            tx.galleryClassificationFilter.createMany({
              data: galleryClassifications.map((el) => ({
                profileId: user.profile.id,
                classificationId: el,
              })),
            }),
          galleryTypes &&
            tx.galleryTypeFilter.createMany({
              data: galleryTypes.map((el) => ({
                profileId: user.profile.id,
                galleryTypeId: el,
              })),
            }),
          orientations &&
            tx.orientation.createMany({
              data: orientations.map((el) => ({
                profileId: user.profile.id,
                artOrientationsId: el,
              })),
            }),
        ];

        const commonPromisesUpdate = [
          tx.profile.update({
            where: {
              id: user.profile.id,
            },
            data: body.preferences,
          }),
        ];
        await Promise.all(
          [
            ...commonPromisesUpdate,
            ...artistPreferencesUpdate,
            ...galleryPromisesUpdate,
          ].filter((el) => typeof el !== 'boolean')
        );
      });
    } catch (err) {
      this.handleErrorHelper.handleProfileClassificationsError(err);

      throw err;
    }
  }

  async getFavoriteProfiles(user: UserReq, pagination: PaginationReq) {
    const [favorites, total] = await Promise.all([
      this.prisma.favorites.findMany({
        where: {
          profileId: user.profile.id,
        },
        select: {
          favoriteProfileId: true,
          id: true,

          favoriteProfile: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      this.prisma.favorites.count({
        where: {
          profileId: user.profile.id,
        },
      }),
    ]);

    const favoritesPhoto = await Promise.all(
      favorites.map(async (el) => {
        const {
          favoriteProfile: {
            user: { name },
          },
        } = el;

        const firstProfilePhoto = await this.prisma.userPhoto.findFirst({
          where: {
            user: {
              profile: {
                id: el.favoriteProfileId,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        });

        return {
          name: name,
          avatarId: firstProfilePhoto?.id ?? null,
          profileId: el.favoriteProfileId,
        };
      })
    );

    return {
      data: favoritesPhoto,
      total,
    };
  }

  async addInitialLimits(
    profileId: number,
    subscription: {
      plan: {
        planLimits: {
          name: PlanLimitName;
          limit: number | null;
          days: number | null;
        }[];
      };
    },
    tx: Omit<
      PrismaClient<PrismaClientOptions, never, DefaultArgs>,
      '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
    >
  ) {
    const limits = subscription.plan.planLimits;
    const likeLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.LIKE
    );
    const rewindLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.REWIND
    );
    const favoritesLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.FAVORITE
    );
    const picksLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.TOP_PICKS
    );
    const boostLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.BOOST
    );
    const superLikeLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.SUPER_LIKE
    );

    if (
      !likeLimits ||
      !rewindLimits ||
      !favoritesLimits ||
      !picksLimits ||
      !boostLimits ||
      !superLikeLimits
    ) {
      throw new BadRequestException('Some limits was not provided');
    }
    const likeResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      likeLimits.days
    );
    const rewindResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      rewindLimits.days
    );
    const favoritesResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      favoritesLimits.days
    );
    const picksResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      picksLimits.days
    );
    const boostResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      boostLimits.days
    );
    const superResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      superLikeLimits.days
    );

    const [
      newLikeLimit,
      newRewindLimit,
      newFavoriteLimit,
      newPicksLimit,
      newBoostLimits,
      newSuperLimits,
    ] = await Promise.all([
      tx.likeLimits.create({
        data: {
          profileId: profileId,
          remainingLikes: likeLimits.limit,
          resetDate: likeLimits.days ? likeResetDate : null,
        },
      }),
      tx.rewindLimits.create({
        data: {
          profileId: profileId,
          resetDate: rewindLimits.days ? rewindResetDate : null,
          remainingRewinds: rewindLimits.limit,
        },
      }),
      tx.favoriteLimits.create({
        data: {
          profileId: profileId,
          resetDate: favoritesLimits.days ? favoritesResetDate : null,
          remainingFavorites: favoritesLimits.limit,
        },
      }),
      tx.topPicksLimit.create({
        data: {
          profileId,
          resetDate: picksLimits.days ? picksResetDate : null,
          remainingPicks: picksLimits.limit,
        },
      }),
      tx.boostLimits.create({
        data: {
          profileId: profileId,
          resetDate: boostLimits.days ? boostResetDate : null,
          remainingBoosts: boostLimits.limit,
        },
      }),
      tx.superLikeLimits.create({
        data: {
          profileId: profileId,
          resetDate: superLikeLimits ? superResetDate : null,
          remainingSuperLikes: superLikeLimits.limit,
        },
      }),
    ]);

    return {
      newLikeLimit,
      newRewindLimit,
      newFavoriteLimit,
      newPicksLimit,
      newBoostLimits,
      newSuperLimits,
    };
  }

  async checkClassificationLimits(
    profileClassifications: Array<number[] | undefined>,
    user: UserReq
  ) {
    const applicationSettings =
      await this.prisma.applicationSettings.findFirst();
    if (!applicationSettings) {
      throw new InternalServerErrorException('Provide application settings');
    }

    const userSubscription = await this.prisma.userSubscription.findUnique({
      where: {
        userId: user.id,
      },
      include: { plan: true },
    });

    if (!userSubscription) {
      throw new BadRequestException('User has no subscription');
    }

    const isPremium = userSubscription.plan.planName === PlanName.PREMIUM;

    const profileClassificationsLimit = isPremium
      ? applicationSettings.classificationsPremiumLimits
      : applicationSettings.classificationsLimits;

    if (
      profileClassificationsLimit &&
      profileClassifications.some(
        (el) => el && el.length > profileClassificationsLimit
      )
    ) {
      throw new BadRequestException(
        `You can’t choose more than ${profileClassificationsLimit} items without premium subscription!`
      );
    }
  }

  async createGallery(data: GalleryProfileReq, user: UserReq) {
    try {
      const {
        classifications,
        orientations,
        galleryTypes,
        location,
        ...profile
      } = data;

      if (!classifications || !orientations || !galleryTypes) {
        throw new BadRequestException(
          'Please specify galleryName, at least 1 classification, orientation and galleryTypes'
        );
      }

      const standard = STANDARD_PLAN.id;

      let subscription = await this.prisma.userSubscription.findUnique({
        where: {
          userId: user.id,
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
      });

      if (!subscription) {
        subscription = await this.prisma.userSubscription.create({
          data: {
            endDate: null,
            userId: user.id,
            planId: standard,
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
        });
      }

      await this.checkProfileHelper.checkClassifications(classifications, [
        ...CLASSIFICATIONS_FOR_GALLERIES,
        ...CLASSIFICATION_COMMON,
      ]);

      await this.checkClassificationLimits(
        [classifications, orientations, galleryTypes],
        user
      );

      const newProfile = await this.prisma.$transaction(async (tx) => {
        const newGalleryProfile = await tx.profile.create({
          data: {
            ...profile,
            role: UserRole.GALLERY,
            userId: user.id,
          },
        });

        await Promise.all([
          tx.profileClassifications.createMany({
            data: classifications.map((el) => ({
              classificationId: el,
              profileId: newGalleryProfile.id,
            })),
          }),
          tx.profileArtOrientations.createMany({
            data: orientations.map((el) => ({
              orientationId: el,
              profileId: newGalleryProfile.id,
            })),
          }),
          tx.profileGalleryTypes.createMany({
            data: galleryTypes.map((el) => ({
              typeId: el,
              profileId: newGalleryProfile.id,
            })),
          }),
          tx.profileSettings.create({
            data: {
              profileId: newGalleryProfile.id,
              lat: location.lat,
              lng: location.lng,
              isLocationAuto: location.isLocationAuto,
            },
          }),
        ]);

        await this.addInitialLimits(newGalleryProfile.id, subscription!, tx);

        return {
          id: newGalleryProfile.id,
          subscription,
        };
      });

      return { id: newProfile.id };
    } catch (err) {
      this.handleErrorHelper.handleProfileClassificationsError(err);

      throw err;
    }
  }

  async getProfileLimits(profileId: number, userId: number) {
    const [
      likeLimit,
      rewindLimit,
      favoriteLimit,
      picksLimit,
      userSubscription,
    ] = await Promise.all([
      this.prisma.likeLimits.findUnique({
        where: {
          profileId: profileId,
        },
      }),
      this.prisma.rewindLimits.findUnique({
        where: {
          profileId: profileId,
        },
      }),
      this.prisma.favoriteLimits.findUnique({
        where: {
          profileId: profileId,
        },
      }),
      this.prisma.topPicksLimit.findUnique({
        where: {
          profileId,
        },
      }),
      this.prisma.userSubscription.findUnique({
        where: {
          userId,
        },
        select: {
          plan: {
            select: {
              planLimits: {
                select: {
                  name: true,
                  days: true,
                  limit: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!likeLimit || !rewindLimit || !favoriteLimit || !picksLimit) {
      throw new BadRequestException('Please provide all user limits');
    }

    if (!userSubscription) {
      throw new NotFoundException('Profile has no subscription');
    }
    const profileLimits = userSubscription.plan.planLimits;

    const renewLikesDays = this.checkProfileHelper.countHoursTillReset(
      likeLimit.resetDate
    );
    const renewRewindsDays = this.checkProfileHelper.countHoursTillReset(
      rewindLimit.resetDate
    );
    const renewFavoritesDays = this.checkProfileHelper.countHoursTillReset(
      favoriteLimit.resetDate
    );
    const renewPicksDays = this.checkProfileHelper.countHoursTillReset(
      picksLimit.resetDate
    );

    const likesPlan = profileLimits.find(
      (el) => el.name === PlanLimitName.LIKE
    );
    const rewindPlan = profileLimits.find(
      (el) => el.name === PlanLimitName.REWIND
    );
    const favoritesPlan = profileLimits.find(
      (el) => el.name === PlanLimitName.FAVORITE
    );
    const picksPlan = profileLimits.find(
      (el) => el.name === PlanLimitName.TOP_PICKS
    );

    if (!likesPlan || !rewindPlan || !favoritesPlan || !picksPlan) {
      throw new NotFoundException('Some profile limits data was not provided ');
    }

    const hourInDay = 24;

    const likesPlanHours = likesPlan.days
      ? likesPlan.days * hourInDay
      : likesPlan.days;

    const rewindPlanHours = rewindPlan.days
      ? rewindPlan.days * hourInDay
      : rewindPlan.days;

    const favoritePlanHours = favoritesPlan.days
      ? favoritesPlan.days * hourInDay
      : favoritesPlan.days;

    const picksPlanHours = picksPlan.days
      ? picksPlan.days * hourInDay
      : picksPlan.days;

    return {
      likeLimit:
        renewLikesDays && renewLikesDays < 0
          ? likesPlan.limit
          : likeLimit.remainingLikes,
      likeLimitMax: likesPlan.limit,
      rewindLimitMax: rewindPlan.limit,
      favoriteLimitMax: favoritesPlan.limit,
      picksLimitMax: picksPlan.limit,
      rewindLimit:
        renewRewindsDays && renewRewindsDays < 0
          ? rewindPlan.limit
          : rewindLimit.remainingRewinds,
      favoriteLimit:
        renewFavoritesDays && renewFavoritesDays < 0
          ? favoritesPlan.limit
          : favoriteLimit.remainingFavorites,
      picksLimit:
        renewPicksDays && renewPicksDays < 0
          ? picksPlan.limit
          : picksLimit.remainingPicks,
      renewLikesDays:
        renewLikesDays && renewLikesDays < 0 ? likesPlanHours : renewLikesDays,
      renewRewindsDays:
        renewRewindsDays && renewRewindsDays < 0
          ? rewindPlanHours
          : renewRewindsDays,
      renewFavoritesDays:
        renewFavoritesDays && renewFavoritesDays < 0
          ? favoritePlanHours
          : renewFavoritesDays,
      renewPicksDays:
        renewPicksDays && renewPicksDays < 0 ? picksPlanHours : renewPicksDays,
    };
  }

  async createArtist(data: ArtistProfileReq, user: UserReq) {
    try {
      const { classifications, location, ...profile } = data;

      if (!classifications) {
        throw new BadRequestException(
          'Please specify at least 1 classification, age, gender '
        );
      }

      await this.checkProfileHelper.checkClassifications(classifications, [
        ...CLASSIFICATION_FOR_PAINTER,
        ...CLASSIFICATION_COMMON,
      ]);

      const standard = STANDARD_PLAN.id;

      let subscription = await this.prisma.userSubscription.findUnique({
        where: {
          userId: user.id,
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
      });

      if (!subscription) {
        subscription = await this.prisma.userSubscription.create({
          data: {
            endDate: null,
            userId: user.id,
            planId: standard,
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
        });
      }

      await this.checkClassificationLimits([classifications], user);

      const newProfile = await this.prisma.$transaction(async (tx) => {
        const newArtistProfile = await tx.profile.create({
          data: {
            ...profile,
            role: UserRole.ARTIST,
            userId: user.id,
          },
        });

        await Promise.all([
          tx.profileClassifications.createMany({
            data: classifications.map((el) => ({
              classificationId: el,
              profileId: newArtistProfile.id,
            })),
            skipDuplicates: true,
          }),
          tx.profileSettings.create({
            data: {
              profileId: newArtistProfile.id,
              lat: location.lat,
              lng: location.lng,
              isLocationAuto: location.isLocationAuto,
            },
          }),
        ]);

        await this.addInitialLimits(newArtistProfile.id, subscription!, tx);

        return { id: newArtistProfile.id, subscription };
      });

      return { id: newProfile.id };
    } catch (err) {
      this.handleErrorHelper.handleProfileClassificationsError(err);

      throw err;
    }
  }

  async createCollector(data: CollectorProfileReq, user: UserReq) {
    const { location, ...profileData } = data;

    const newProfile = await this.prisma.$transaction(async (tx) => {
      const newCollectorProfile = await tx.profile.create({
        data: {
          ...profileData,
          role: UserRole.COLLECTOR,
          userId: user.id,
        },
      });

      const standard = STANDARD_PLAN.id;

      let subscription = await tx.userSubscription.findUnique({
        where: {
          userId: user.id,
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
      });

      if (!subscription) {
        subscription = await tx.userSubscription.create({
          data: {
            endDate: null,
            userId: user.id,
            planId: standard,
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
        });
      }

      await Promise.all([
        tx.profileSettings.create({
          data: {
            profileId: newCollectorProfile.id,
            lat: location.lat,
            lng: location.lng,
            isLocationAuto: location.isLocationAuto,
          },
        }),
      ]);

      await this.addInitialLimits(newCollectorProfile.id, subscription, tx);

      return { id: newCollectorProfile.id, subscription };
    });

    return { id: newProfile.id };
  }

  async getProfileClassificationsData(profileId: number) {
    const [
      profileClassifications,
      profileArtOrientations,
      profileGalleryTypes,
    ] = await Promise.all([
      this.prisma.classifications.findMany({
        where: {
          profileClassifications: {
            some: {
              profileId,
            },
          },
        },
      }),
      this.prisma.artOrientations.findMany({
        where: {
          profileArtOrientations: {
            some: {
              profileId,
            },
          },
        },
      }),
      this.prisma.galleryTypes.findMany({
        where: {
          profileGalleryTypes: {
            some: {
              profileId,
            },
          },
        },
      }),
    ]);

    return {
      classifications: {
        profileArtOrientations,
        profileClassifications,
        profileGalleryTypes,
      },
    };
  }

  async getProfiles(user: UserReq, { skip = 0, limit = 10 }) {
    try {
      const [
        artistClassificationsFilter,
        galleryClassificationsFilter,
        orientationsFilter,
        galleryTypesFilter,
        allClassifications,
        allGalleryTypes,
        allOrientations,
        myLikes,
        { data: matchedProfiles },
        actualUnLikes,
        profileSettings,
        mySuperLikes,
      ] = await Promise.all([
        this.prisma.artistClassificationFilter.findMany({
          where: { profileId: user.profile.id },
        }),
        this.prisma.galleryClassificationFilter.findMany({
          where: { profileId: user.profile.id },
        }),
        this.prisma.orientation.findMany({
          where: { profileId: user.profile.id },
        }),
        this.prisma.galleryTypeFilter.findMany({
          where: { profileId: user.profile.id },
        }),

        this.prisma.classifications.findMany(),
        this.prisma.galleryTypes.findMany(),
        this.prisma.artOrientations.findMany(),

        this.likesService.getMyLikes(user),
        this.likesService.getMatches({ user }),
        this.likesService.getActualUnLikes(user),
        this.getProfileSettings(user),
        this.likesService.getMySuperLikes(user),
      ]);

      //Get chosen filters
      const orientationFilter = orientationsFilter.map(
        (el) => el.artOrientationsId
      );
      const classificationFilter = [
        ...artistClassificationsFilter.map((el) => el.classificationId),
        ...galleryClassificationsFilter.map((el) => el.classificationId),
      ];
      const galleryTypeFilter = galleryTypesFilter.map(
        (el) => el.galleryTypeId
      );

      //Get liked, matched, unLiked users
      const likedProfilesId = myLikes.map((el) => el.likedProfileId);
      const matchedProfilesId = matchedProfiles.map((el) => el.profileId);
      const unLikes = actualUnLikes.map((el) => el.unLikedProfileId);
      const superLikes = mySuperLikes.map((el) => el.superLikedProfileId);

      //I am looking for
      const lookingFor = this.checkProfileHelper.getLookingFor(user.profile);

      const earthRadius = 6371;

      const isLocationPreferenceManual =
        profileSettings.cityPreference &&
        profileSettings.countryPreference &&
        !profileSettings.isLocationPreferenceAuto;

      const distanceQuery = Prisma.sql`
    ${earthRadius} * acos( cos( radians(${profileSettings.lat}::decimal) )
      * cos( radians( ps.lat ) )
      * cos( radians( ps.lng ) - radians(${profileSettings.lng}::decimal) ) +
        sin( radians(${profileSettings.lat}::decimal) )
      * sin(radians(ps.lat)))`;

      const result = (await this.prisma.$queryRaw`
        SELECT p.id AS id
        FROM "Profile" AS "p"
        LEFT JOIN "ProfileClassifications" AS "pc"
        ON p.id = "pc"."profileId" AND "pc"."classificationId" IN (${Prisma.join(
          classificationFilter.length
            ? classificationFilter
            : allClassifications.map((el) => el.id)
        )})
        LEFT JOIN "User" AS "u"
        ON u.id = "p"."userId"

        LEFT JOIN "UserPhoto" AS "ph"
        ON u.id = "ph"."userId"

        LEFT JOIN "Boosts" AS "b"
        ON p.id = "b"."profileId"
            AND b."endTime" IS NOT NULL
            AND  b."endTime" > ${new Date()}

        LEFT JOIN "ProfileArtOrientations" AS "po"
        ON p.id = "po"."profileId" AND "po"."orientationId" IN (${Prisma.join(
          orientationFilter.length
            ? orientationFilter
            : allOrientations.map((el) => el.id)
        )})
        LEFT JOIN "ProfileSettings" AS "ps"
        ON p.id = "ps"."profileId"
        LEFT JOIN "ProfileGalleryTypes" AS "gt"
        ON p.id = "gt"."profileId" AND "gt"."typeId" IN (${Prisma.join(
          galleryTypeFilter.length
            ? galleryTypeFilter
            : allGalleryTypes.map((el) => el.id)
        )})

        WHERE  "p"."userId" != ${user.id}
        AND ph.id IS NOT NULL
        
        AND (p."isLookingForGallery" IS TRUE
        OR p."isLookingForArtist" IS TRUE
        OR p."isLookingForCollector" IS TRUE )

        ${
          isLocationPreferenceManual
            ? Prisma.sql`
          AND p.city = ${profileSettings.cityPreference}`
            : Prisma.empty
        }
        ${
          isLocationPreferenceManual
            ? Prisma.sql`
        AND  p.country = ${profileSettings.countryPreference}`
            : Prisma.empty
        }

        ${
          !isLocationPreferenceManual
            ? Prisma.sql`
          AND (ps.lat IS NULL OR ps.lng IS NULL OR (ps.lat = ${profileSettings.lat}::decimal AND ps.lng = ${
            profileSettings.lng
          }::decimal) 
              OR ${distanceQuery}::float < ${profileSettings.distancePreference})`
            : Prisma.empty
        }

        ${
          [...likedProfilesId, ...matchedProfilesId, ...superLikes].length
            ? Prisma.sql`
            AND "p"."id" NOT IN (${Prisma.join([
              ...likedProfilesId,
              ...matchedProfilesId,
              ...superLikes,
            ])})`
            : Prisma.empty
        }
        ${
          unLikes.length
            ? Prisma.sql`
            AND "p"."id" NOT IN (${Prisma.join(unLikes)})`
            : Prisma.empty
        }

        GROUP BY p.id

        ORDER BY (
          CASE WHEN COUNT(b.id) > 0
            THEN 2
            ELSE 0
          END
          +
          CASE WHEN

          (
          SUM("pc"."classificationId") IS NOT NULL
          OR SUM("po"."orientationId") IS NOT NULL
          OR SUM("gt"."typeId") IS NOT NULL
          OR p.role::text = ${UserRole.COLLECTOR})
          ${
            lookingFor.length
              ? Prisma.sql`
          AND  p.role::text IN (${Prisma.join(lookingFor)})`
              : Prisma.empty
          }
          ${
            !lookingFor.length
              ? Prisma.sql`
          AND  p.id != p.id`
              : Prisma.empty
          }
          THEN 1
          ELSE 0
          END
        ) DESC, p.id
        LIMIT ${limit + 1}
        OFFSET ${skip}
      `) as IdRes[];

      const next = result[limit];

      return {
        data: next ? result.slice(0, -1) : result,
        next: next ? true : false,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getProfileById(user: UserReq, profileId: number) {
    const profileSettings = await this.getProfileSettings(user);

    const [profileData, classificationsData] = await Promise.all([
      this.prisma.$queryRaw`
      SELECT "p"."id",
      "p"."age",
      "p"."gender",
      "p"."birthdate",
      "p"."aboutMe",
      "p"."country",
      "p"."city",
      "p"."role",
      "p"."galleryName",
      "p"."profileDescription",
      "ps"."distancePreference",
      "u"."isPhoneVerified",
      "u"."isEmailVerified",
      "u"."name",
      "u"."id" as "userId",
      "u"."email",
      "u"."phoneNumber",
      "p"."isLookingForArtist",
      "p"."isLookingForCollector",
      "p"."isLookingForGallery",
      CASE
        WHEN f."profileId" IS NULL
        THEN false
        ELSE true
        END "isInFavorites" ,

      CASE
        WHEN (ps.lat = ${profileSettings.lat}::decimal AND ps.lng = ${
        profileSettings.lng
      }::decimal)
        THEN 0
        ELSE ${this.getDistance(profileSettings)}
        END "distance" 


      FROM "Profile" AS "p"
      LEFT JOIN "User" AS "u" ON "p"."userId" = "u"."id"
      LEFT JOIN "ProfileSettings" AS "ps" ON "ps"."profileId" = "p"."id"
      LEFT JOIN "Favorites" AS "f" ON "f"."profileId" = ${
        user.profile.id
      } AND f."favoriteProfileId" = p.id


      WHERE "p"."id" = ${profileId}
    ` as Promise<UserByIdData[]>,
      this.getProfileClassificationsData(profileId),
    ]);

    if (!profileData[0]) {
      throw new BadRequestException('No profile by id found');
    }

    const profilePhotos = await this.getUserPhotos(profileData[0].userId);

    if (!profilePhotos.length) {
      throw new NotFoundException('Profile not found');
    }

    const {
      email,
      isEmailVerified,
      isPhoneVerified,
      name,
      phoneNumber,
      ...restProfileData
    } = profileData[0];

    const profileOwner = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    const userSubscription = await this.prisma.userSubscription.findUnique({
      where: { userId: profileOwner?.userId },
      select: { plan: { select: { planName: true } } },
    });

    if (!userSubscription) {
      throw new BadRequestException('User has no subscription');
    }

    const reqUserProfile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!reqUserProfile) {
      throw new NotFoundException('Profile not found');
    }

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

    const isUserUnLiked = await this.prisma.unLikes.findFirst({
      where: {
        unLikeDate: {
          gte: minDislikeDate.toISOString(),
        },
        profileId: reqUserProfile.id,
        unLikedProfileId: profileId,
      },
    });

    return {
      ...classificationsData,
      ...restProfileData,
      profilePhotos: profilePhotos,
      avatar: profilePhotos[0],
      user: { isEmailVerified, isPhoneVerified, name, phoneNumber, email },
      isPremium: userSubscription.plan.planName === PlanName.PREMIUM,
      isUserUnLiked: isUserUnLiked ? true : false,
    };
  }

  async getUserPhotos(userId: number) {
    const profilePhotosData = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        userPhoto: {
          select: {
            id: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        profile: {
          select: {
            avatar: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!profilePhotosData) {
      throw new NotFoundException('No user found');
    }

    const userPhotos = profilePhotosData.userPhoto.map((el) => el.id);

    return userPhotos;
  }

  async getMyProfile(user: UserReq) {
    const [profileData, classificationsData, profileLimits, profileProgress] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            phoneNumber: true,
            name: true,
            userPhoto: {
              select: {
                id: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
            profile: {
              select: {
                id: true,
                age: true,
                gender: true,
                birthdate: true,
                aboutMe: true,
                country: true,
                city: true,
                role: true,
                galleryName: true,
                profileDescription: true,
                isLookingForArtist: true,
                isLookingForCollector: true,
                isLookingForGallery: true,
                isTutorialShown: true,
                profileSettings: {
                  select: {
                    emailNotificationsRecieveType: true,
                    pushOnNewMessage: true,
                    pushOnLikes: true,
                    pushOnAddedToFavorites: true,
                    pushOnNewMatch: true,
                    pushOnAppNews: true,
                    distancePreference: true,
                  },
                },
                avatar: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        }),
        this.getProfileClassificationsData(user.profile.id),
        this.getProfileLimits(user.profile.id, user.id),
        this.profileProgressHelper.getProfileProgress(user),
      ]);
    if (!profileData) {
      throw new NotFoundException('No user found');
    }
    if (!profileData.profile) {
      throw new BadRequestException('User has no profile');
    }

    const userPhotos = profileData.userPhoto.map((el) => el.id);

    const userSubscription = await this.prisma.userSubscription.findUnique({
      where: { userId: user.id },
      select: { plan: { select: { planName: true } } },
    });

    if (!userSubscription) {
      throw new BadRequestException('User has no subscription');
    }

    return {
      user: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        name: user.name,
        phoneNumber: user.phoneNumber,
        steps: {
          isLookingForCompleted: profileData.profile
            ? profileData.profile.isLookingForArtist ||
              profileData.profile.isLookingForCollector ||
              profileData.profile.isLookingForGallery
            : false,
          isPhotosLoaded: profileData.userPhoto.length ? true : false,
          isProfileCompleted: profileData.profile ? true : false,
          isNumberEntered: profileData.phoneNumber ? true : false,
          isNameEntered: profileData.name !== appleUserName ? true : false,
        },
      },
      profileLimits,
      profilePhotos: userPhotos,
      ...profileData.profile,
      ...classificationsData,
      progress: profileProgress.percentage,
      isPremium: userSubscription.plan.planName === PlanName.PREMIUM,
    };
  }

  async getMatchedProfiles(user: UserReq, body: PaginationReq) {
    const { data: matches, total } = await this.likesService.getMatches({
      user,
      body,
    });

    return {
      data: matches,
      total,
    };
  }

  async getUnMatchedProfiles(user: UserReq, body: PaginationReq) {
    const { unMatches, total } = await this.likesService.getUnMatches(
      user,
      body
    );

    return {
      total,
      data: unMatches,
    };
  }

  async getNewLikes(user: UserReq, pagination: PaginationReq) {
    const dateLastWeek = new Date();
    dateLastWeek.setDate(dateLastWeek.getDate() - 7);
    const { data: myLikes, total } = await this.likesService.getLikedMe(user, {
      pagination,
      minDate: dateLastWeek,
    });

    const result = myLikes.map((el) => {
      const { superLikedProfileId, ...likeData } = el;

      return {
        ...likeData,
        isSuperLiked: superLikedProfileId ? true : false,
      };
    });

    return {
      data: result,
      total,
    };
  }

  async getProfileFilters(user: UserReq) {
    const [
      galleryClassifications,
      artistClassifications,
      orientFilter,
      typeFilter,
    ] = await Promise.all([
      this.prisma.galleryClassificationFilter.findMany({
        where: {
          profileId: user.profile.id,
        },
        select: {
          classificationId: true,
        },
      }),
      this.prisma.artistClassificationFilter.findMany({
        where: {
          profileId: user.profile.id,
        },
        select: {
          classificationId: true,
        },
      }),
      this.prisma.orientation.findMany({
        where: {
          profileId: user.profile.id,
        },
        select: {
          artOrientationsId: true,
        },
      }),
      this.prisma.galleryTypeFilter.findMany({
        where: {
          profileId: user.profile.id,
        },
        select: {
          galleryTypeId: true,
        },
      }),
    ]);

    return {
      galleryClassifications,
      artistClassifications,
      orientFilter,
      typeFilter,
    };
  }

  async getTopProfiles(user: UserReq) {
    const [
      userSubscription,
      profileSettings,
      {
        galleryClassifications,
        artistClassifications,
        orientFilter,
        typeFilter,
      },
      myLikes,
      matches,
      unlikes,
      superLikes,
    ] = await Promise.all([
      this.prisma.userSubscription.findUnique({
        where: {
          endDate: null,
          userId: user.id,
        },
        select: {
          plan: {
            select: {
              planName: true,
              planLimits: {
                where: {
                  name: PlanLimitName.TOP_PICKS,
                },
              },
            },
          },
        },
      }),
      this.getProfileSettings(user),
      this.getProfileFilters(user),
      this.likesService.getMyLikes(user),
      this.likesService.getMatches({ user }),
      this.likesService.getActualUnLikes(user),
      this.likesService.getMySuperLikes(user),
    ]);

    if (!userSubscription) {
      throw new BadRequestException('No subscription found');
    }

    const actionsPerPeriod = userSubscription.plan.planLimits[0].limit;
    const periodInDays = userSubscription.plan.planLimits[0].days;

    const allClassifications = [
      ...galleryClassifications,
      ...artistClassifications,
    ];
    const value = (await this.cacheManager.get(user.profile.id.toString())) as {
      users: ShortProfilePhotoPhotoRes[];
      endDate: Date | null;
    };

    const users = await this.prisma.profile.findMany({
      where: {
        id: { in: value ? value.users.map((el) => el.profileId) : [] },
      },
    });

    const topPickedProfiles = await this.prisma.$transaction(async (tx) => {
      if (value) {
        if (users.length !== 0) {
          const withoutDeletedUsers = value.users.filter((el) =>
            users.map((el) => el.id).includes(el.profileId)
          );

          const msToEnd = value.endDate
            ? new Date(value.endDate).getTime() - new Date().getTime()
            : undefined;

          await this.cacheManager.del(user.profile.id.toString());

          if (msToEnd && msToEnd > 0) {
            await this.cacheManager.set(
              user.profile.id.toString(),
              { users: withoutDeletedUsers, endDate: value.endDate },
              msToEnd
            );
          }

          return withoutDeletedUsers;
        }
      }
      const myLikesProfileIds = myLikes.map((el) => el.likedProfileId);
      const matchesProfileIds = matches.data.map((el) => el.profileId);
      const unLikesProfileIds = unlikes.map((el) => el.unLikedProfileId);
      const superLikesProfileIds = superLikes.map(
        (el) => el.superLikedProfileId
      );

      const [profiles] = await Promise.all([
        tx.$queryRaw`
        SELECT p.id as "profileId",
        u.name
        FROM "Profile" AS p
        LEFT JOIN "User" AS u
        ON p."userId" = u.id
        LEFT JOIN "ProfileSettings" AS ps
        ON ps."profileId" = p.id
        LEFT JOIN "ProfileClassifications" AS pc
        ON pc."profileId" = p.id ${
          allClassifications.length
            ? Prisma.sql`AND pc."classificationId" IN  (${Prisma.join(
                allClassifications.map((el) => el.classificationId)
              )})`
            : Prisma.empty
        }

        LEFT JOIN "ProfileArtOrientations" AS po
        ON po."profileId" = p.id ${
          orientFilter.length
            ? Prisma.sql`AND po."orientationId" IN  (${Prisma.join(
                orientFilter.map((el) => el.artOrientationsId)
              )})`
            : Prisma.empty
        }

        LEFT JOIN "ProfileGalleryTypes" AS pg
        ON pg."profileId" = p.id ${
          typeFilter.length
            ? Prisma.sql`AND pg."typeId" IN  (${Prisma.join(
                typeFilter.map((el) => el.galleryTypeId)
              )})`
            : Prisma.empty
        }
        WHERE p.id != ${user.profile.id}
        AND (p."isLookingForGallery" IS TRUE
        OR p."isLookingForArtist" IS TRUE
        OR p."isLookingForCollector" IS TRUE )
        ${
          [...myLikesProfileIds, ...matchesProfileIds, ...superLikesProfileIds]
            .length
            ? Prisma.sql`
            AND "p"."id" NOT IN (${Prisma.join([
              ...myLikesProfileIds,
              ...matchesProfileIds,
              ...superLikesProfileIds,
            ])})`
            : Prisma.empty
        }
        ${
          unLikesProfileIds.length
            ? Prisma.sql`
            AND "p"."id" NOT IN (${Prisma.join(unLikesProfileIds)})`
            : Prisma.empty
        }
        GROUP BY p.id,u.id, ps.id

        ORDER BY ( CASE WHEN SUM("pc"."classificationId") IS NOT NULL
          THEN 1
          ELSE 0
          END
          +
          CASE WHEN SUM("po"."orientationId") IS NOT NULL
          THEN 1
          ELSE 0
          END
          +
          CASE WHEN SUM("pg"."typeId") IS NOT NULL
          THEN 1
          ELSE 0
          END
          +
          ${
            profileSettings.countryPreference
              ? Prisma.sql`
          CASE WHEN p.country = ${profileSettings.countryPreference}
          THEN 1
          ELSE 0
          END
          +
       `
              : Prisma.empty
          }
      ${
        profileSettings.cityPreference
          ? Prisma.sql`
          CASE WHEN p.city = ${profileSettings.cityPreference}
          THEN 1
          ELSE 0
          END
          +
       `
          : Prisma.empty
      }


          CASE WHEN p.role::text = ${UserRole.ARTIST}
          AND ${user.profile.isLookingForArtist} IS TRUE
          THEN 1 ELSE 0 END
          +
          CASE WHEN p.role::text = ${UserRole.GALLERY}
          AND ${user.profile.isLookingForGallery} IS TRUE
          THEN 1 ELSE 0 END
          +

          CASE WHEN p.role::text = ${UserRole.COLLECTOR}
          AND ${user.profile.isLookingForCollector} IS TRUE
          THEN 1 ELSE 0 END
          +
          CASE WHEN (ps.lat = ${profileSettings.lat}::decimal AND ps.lng = ${profileSettings.lng}::decimal) 
          OR  ${this.getDistance(profileSettings)} < ${
          profileSettings.distancePreference
          }
          THEN 1 ELSE 0 END
        ) DESC


          ${
            actionsPerPeriod !== null
              ? Prisma.sql`LIMIT ${actionsPerPeriod}`
              : Prisma.empty
          }
    ` as PrismaPromise<ShortProfileByIdRes[]>,
      ]);

      const topWithPhoto = await Promise.all(
        profiles.map(async (el: ShortProfileByIdRes) => {
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

          return { ...el, avatarId: firstProfilePhoto?.id ?? null };
        })
      );

      return topWithPhoto;
    });

    const msInDay = 24 * 60 * 60 * 1000;

    if (!value || users.length === 0) {
      const endDateOfCaching = periodInDays
        ? new Date(new Date().getTime() + 0.0005 * msInDay)
        : null;

      await this.cacheManager.set(
        user.profile.id.toString(),
        { users: topPickedProfiles, endDate: endDateOfCaching },
        periodInDays ? 0.0005 * msInDay : undefined
      );
    }

    return topPickedProfiles;
  }

  async uploadProfilePhoto(userId: number, file: Express.Multer.File) {
    const profilePhotos = await this.prisma.userPhoto.findMany({
      where: { userId: userId },
    });

    if (profilePhotos.length >= 9) {
      throw new BadRequestException(
        'You already have 9 photos in your profile!'
      );
    }

    const order = profilePhotos.length + 1;

    return this.filesService.uploadProfilePhoto({
      mimetype: file.mimetype,
      contents: file.buffer,
      userId,
      order,
    });
  }

  async replaceProfilePhoto(
    userId: number,
    file: Express.Multer.File,
    order: number
  ) {
    const photoToReplace = await this.prisma.userPhoto.findFirst({
      where: { userId, order },
      select: { id: true, name: true },
    });

    if (!photoToReplace) {
      throw new BadRequestException('Photo with this order number not found');
    }

    await this.prisma.$transaction(async (tx) => {
      try {
        const deletedPhoto = await tx.userPhoto.delete({
          where: { id: photoToReplace.id },
        });

        await this.filesService.deleteProfilePhoto(deletedPhoto.name);
      } catch {
        throw new NotFoundException('File not found');
      }
    });

    return this.filesService.uploadProfilePhoto({
      mimetype: file.mimetype,
      contents: file.buffer,
      userId,
      order,
    });
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new BadRequestException('User does not have profile');
    }

    await this.filesService.uploadAvatar({
      mimetype: file.mimetype,
      contents: file.buffer,
      profileId: profile.id,
    });
  }

  async deleteProfilePhoto(fileId: number, userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new BadRequestException('User doesnt have profile');
    }

    const photoCount = await this.prisma.userPhoto.count({
      where: { userId: userId },
    });

    if (photoCount === 1) {
      throw new BadRequestException("You can't delete your only photo");
    }

    const photoToDelete = await this.prisma.userPhoto.findUnique({
      where: { id: fileId },
    });

    if (!photoToDelete) {
      throw new NotFoundException('Photo not found');
    }

    if (photoToDelete.userId !== userId) {
      throw new ForbiddenException('User is not owner of this photo');
    }

    await this.prisma.$transaction(async (tx) => {
      try {
        const deletedPhoto = await tx.userPhoto.delete({
          where: { id: fileId },
        });

        await tx.userPhoto.updateMany({
          where: { order: { gt: deletedPhoto.order } },
          data: { order: { decrement: 1 } },
        });
      } catch {
        throw new NotFoundException('File not found');
      }

      await this.filesService.deleteProfilePhoto(photoToDelete.name);
    });
  }

  async getProfileSettings(user: UserReq) {
    const settings = await this.prisma.profileSettings.findUnique({
      where: {
        profileId: user.profile.id,
      },
    });

    if (!settings) {
      throw new BadRequestException('Please provide setting');
    }

    return settings;
  }

  getDistance(profileSettings: ProfileSettings) {
    const earthRadius = 6371;

    const distanceQuery = Prisma.sql`
    ${earthRadius} * acos( cos( radians(${profileSettings.lat}) )
        * cos( radians( ps.lat ) )
        * cos( radians( ps.lng ) - radians(${profileSettings.lng}) ) +
          sin( radians(${profileSettings.lat}) )
        * sin(radians(ps.lat)))
    `;

    return distanceQuery;
  }

  async changePhotoOrder(orderedIds: number[]) {
    await Promise.all(
      orderedIds.map((id, idx) =>
        this.prisma.userPhoto.update({
          where: { id },
          data: { order: idx + 1 },
        })
      )
    );
  }

  async updateProfilesLimits(
    profileIds: number[],
    subscriptionLimits: {
      name: PlanLimitName;
      days: number | null;
      limit: number | null;
    }[]
  ) {
    const likeLimits = this.checkProfileHelper.findLimitByName(
      subscriptionLimits,
      PlanLimitName.LIKE
    );
    const rewindLimits = this.checkProfileHelper.findLimitByName(
      subscriptionLimits,
      PlanLimitName.REWIND
    );
    const favoritesLimits = this.checkProfileHelper.findLimitByName(
      subscriptionLimits,
      PlanLimitName.FAVORITE
    );
    const picksLimits = this.checkProfileHelper.findLimitByName(
      subscriptionLimits,
      PlanLimitName.TOP_PICKS
    );
    const boostLimits = this.checkProfileHelper.findLimitByName(
      subscriptionLimits,
      PlanLimitName.BOOST
    );
    const superLikeLimits = this.checkProfileHelper.findLimitByName(
      subscriptionLimits,
      PlanLimitName.SUPER_LIKE
    );

    if (
      !likeLimits ||
      !rewindLimits ||
      !favoritesLimits ||
      !picksLimits ||
      !boostLimits ||
      !superLikeLimits
    ) {
      throw new BadRequestException('Some limits were not provided');
    }

    const likeResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      likeLimits.days
    );
    const rewindResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      rewindLimits.days
    );
    const favoritesResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      favoritesLimits.days
    );
    const picksResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      picksLimits.days
    );
    const boostResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      boostLimits.days
    );
    const superResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      superLikeLimits.days
    );

    await Promise.all([
      this.prisma.likeLimits.updateMany({
        where: {
          profileId: { in: profileIds },
        },
        data: {
          remainingLikes: likeLimits.limit,
          resetDate: likeLimits.days ? likeResetDate : null,
        },
      }),
      this.prisma.rewindLimits.updateMany({
        where: {
          profileId: { in: profileIds },
        },
        data: {
          resetDate: rewindLimits.days ? rewindResetDate : null,
          remainingRewinds: rewindLimits.limit,
        },
      }),
      this.prisma.favoriteLimits.updateMany({
        where: {
          profileId: { in: profileIds },
        },
        data: {
          resetDate: favoritesLimits.days ? favoritesResetDate : null,
          remainingFavorites: favoritesLimits.limit,
        },
      }),
      this.prisma.topPicksLimit.updateMany({
        where: {
          profileId: { in: profileIds },
        },
        data: {
          resetDate: picksLimits.days ? picksResetDate : null,
          remainingPicks: picksLimits.limit,
        },
      }),
      this.prisma.boostLimits.updateMany({
        where: {
          profileId: { in: profileIds },
        },
        data: {
          resetDate: boostLimits.days ? boostResetDate : null,
          remainingBoosts: boostLimits.limit,
        },
      }),
      this.prisma.superLikeLimits.updateMany({
        where: {
          profileId: { in: profileIds },
        },
        data: {
          resetDate: superLikeLimits ? superResetDate : null,
          remainingSuperLikes: superLikeLimits.limit,
        },
      }),
    ]);
  }

  async switchPremium(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      await this.prisma.userSubscription.create({
        data: {
          endDate: null,
          userId,
          planId: PREMIUM_PLAN.id,
          wasPaid: true,
        },
      });

      return;
    }

    const userCurrentSubscription =
      await this.prisma.userSubscription.findUnique({
        where: { userId },
        select: {
          id: true,
        },
      });

    if (!userCurrentSubscription) {
      throw new BadRequestException('User has no plan');
    }

    const premiumPlan = PREMIUM_PLAN;

    const [_, subscription] = await this.prisma.$transaction([
      this.prisma.userSubscription.delete({
        where: { id: userCurrentSubscription.id },
      }),
      this.prisma.userSubscription.create({
        data: {
          endDate: null,
          userId,
          planId: premiumPlan.id,
          wasPaid: true,
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

    const limits = subscription.plan.planLimits;

    const likeLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.LIKE
    );
    const rewindLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.REWIND
    );
    const favoritesLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.FAVORITE
    );
    const picksLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.TOP_PICKS
    );
    const boostLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.BOOST
    );
    const superLikeLimits = this.checkProfileHelper.findLimitByName(
      limits,
      PlanLimitName.SUPER_LIKE
    );

    if (
      !likeLimits ||
      !rewindLimits ||
      !favoritesLimits ||
      !picksLimits ||
      !boostLimits ||
      !superLikeLimits
    ) {
      throw new BadRequestException('Some limits were not provided');
    }

    const likeResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      likeLimits.days
    );
    const rewindResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      rewindLimits.days
    );
    const favoritesResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      favoritesLimits.days
    );
    const picksResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      picksLimits.days
    );
    const boostResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      boostLimits.days
    );
    const superResetDate = this.checkProfileHelper.calculateResetDate(
      new Date(),
      superLikeLimits.days
    );

    await Promise.all([
      this.prisma.likeLimits.update({
        where: {
          profileId: profile.id,
        },
        data: {
          remainingLikes: likeLimits.limit,
          resetDate: likeLimits.days ? likeResetDate : null,
        },
      }),
      this.prisma.rewindLimits.update({
        where: {
          profileId: profile.id,
        },
        data: {
          resetDate: rewindLimits.days ? rewindResetDate : null,
          remainingRewinds: rewindLimits.limit,
        },
      }),
      this.prisma.favoriteLimits.update({
        where: {
          profileId: profile.id,
        },
        data: {
          resetDate: favoritesLimits.days ? favoritesResetDate : null,
          remainingFavorites: favoritesLimits.limit,
        },
      }),
      this.prisma.topPicksLimit.update({
        where: {
          profileId: profile.id,
        },
        data: {
          resetDate: picksLimits.days ? picksResetDate : null,
          remainingPicks: picksLimits.limit,
        },
      }),
      this.prisma.boostLimits.update({
        where: {
          profileId: profile.id,
        },
        data: {
          resetDate: boostLimits.days ? boostResetDate : null,
          remainingBoosts: boostLimits.limit,
        },
      }),
      this.prisma.superLikeLimits.update({
        where: {
          profileId: profile.id,
        },
        data: {
          resetDate: superLikeLimits ? superResetDate : null,
          remainingSuperLikes: superLikeLimits.limit,
        },
      }),
    ]);
    await this.cacheManager.reset();
  }

  async markTutorialAsShown(userId: number) {
    return this.prisma.profile.update({
      where: { userId },
      data: { isTutorialShown: true },
    });
  }
}
