import { FullProfileDto, UserReq } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import { PROGRESS_PERCENTAGE } from '@app/prisma';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class ProfileProgressHelper {
  constructor(private prisma: PrismaService) {}
  async getProfileProgress(user: UserReq) {
    try {
      if (!user.profile) {
        throw new BadRequestException('Profile not found');
      }

      const progressEstimates = PROGRESS_PERCENTAGE.filter(
        (el) => el.role === user.profile.role
      )[0];

      if (!progressEstimates) {
        throw new BadRequestException(
          'Progress estimates not found for this role'
        );
      }

      const {
        galleryType: galleryTypeEstimate,
        artClassifications: classificationEstimate,
        ...profileEstimates
      } = progressEstimates;

      const profileEstimateKeys = Object.entries(profileEstimates).filter(
        ([key, value]) => key !== 'id' && typeof value !== 'string'
      );
      const initialValue = 0;

      //if field is filled - add progress percentage
      const profileProgressPercentage = profileEstimateKeys.reduce(
        (prevEstimate, [estimateKey, estimateValue]) => {
          if (typeof estimateValue === 'string') {
            throw new InternalServerErrorException(
              'oops, how did you get string value here?'
            );
          }

          const doesUserFilledField =
            user.profile[estimateKey as keyof FullProfileDto] ||
            user[estimateKey as keyof UserReq]
              ? true
              : false;

          return doesUserFilledField && estimateValue
            ? prevEstimate + estimateValue
            : prevEstimate;
        },
        initialValue
      );

      const [firstClassification, firstGalleryType] = await Promise.all([
        this.prisma.profileClassifications.findFirst({
          where: {
            profileId: user.profile.id,
          },
        }),
        this.prisma.profileGalleryTypes.findFirst({
          where: {
            profileId: user.profile.id,
          },
        }),
      ]);

      let fullPercentageAmount = profileProgressPercentage;

      if (firstClassification && classificationEstimate) {
        fullPercentageAmount += classificationEstimate;
      }

      if (firstGalleryType && galleryTypeEstimate) {
        fullPercentageAmount += galleryTypeEstimate;
      }

      return { percentage: fullPercentageAmount };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
