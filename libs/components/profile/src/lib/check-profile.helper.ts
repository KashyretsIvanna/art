import { FullProfileDto } from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PlanLimitName, UserRole } from '@prisma/client';

@Injectable()
export class CheckProfileHelper {
  constructor(private prisma: PrismaService) {}

  async checkClassifications(
    incomingClassificationIds: number[],
    requiredClassifications: { classificationName: string }[]
  ) {
    const classificationEntities = await this.prisma.classifications.findMany({
      where: { id: { in: incomingClassificationIds } },
    });

    const allowedClassifications = requiredClassifications.map(
      (el) => el.classificationName
    );
    const filteredClassifications = classificationEntities.filter((el) =>
      allowedClassifications.includes(el.classificationName)
    );

    if (
      classificationEntities.length !== incomingClassificationIds.length ||
      incomingClassificationIds.length !== filteredClassifications.length
    ) {
      throw new BadRequestException('Unexpected classification id specified');
    }
  }

  calculateResetDate(baseDate: Date, days: number | null) {
    const resetDate = new Date(baseDate);
    resetDate.setDate(resetDate.getDate() + (days || 0));

    return resetDate;
  }

  findLimitByName(
    limits: {
      name: PlanLimitName;
      limit: number | null;
      days: number | null;
    }[],
    name: string
  ) {
    return limits.find((el) => el.name === name);
  }

  getLookingFor(profile: FullProfileDto) {
    const lookingFor = [
      profile.isLookingForArtist && UserRole.ARTIST,
      profile.isLookingForGallery && UserRole.GALLERY,
      profile.isLookingForCollector && UserRole.COLLECTOR,
    ].filter((el) => typeof el !== 'boolean');

    return lookingFor;
  }

  countHoursTillReset(resetDate: Date | null) {
    const msInHour = 1000 * 3600;

    const renewPicksHours = resetDate
      ? Math.round((resetDate.getTime() - new Date().getTime()) / msInHour)
      : null;

    return renewPicksHours;
  }
}
