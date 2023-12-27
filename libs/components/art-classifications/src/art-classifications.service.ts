import { PrismaService } from '@app/common/prisma';
import {
  CLASSIFICATIONS_FOR_GALLERIES,
  CLASSIFICATION_FOR_PAINTER,
} from '@app/prisma';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Classifications, UserRole } from '@prisma/client';

@Injectable()
export class ArtClassificationsService {
  constructor(private prisma: PrismaService) {}

  async getClassifications(role: UserRole) {
    if (role === UserRole.ARTIST) {
      const names = CLASSIFICATION_FOR_PAINTER.map(
        (el) => el.classificationName
      );
      const entities = (await this.prisma.classifications.findMany({
        where: { classificationName: { in: names } },
      })) as Classifications[];

      return entities;
    }

    if (role === UserRole.GALLERY) {
      const names = CLASSIFICATIONS_FOR_GALLERIES.map(
        (el) => el.classificationName
      );
      const entities = (await this.prisma.classifications.findMany({
        where: { classificationName: { in: names } },
      })) as Classifications[];

      return entities;
    }

    throw new ForbiddenException(
      'Classifications are not available for this role'
    );
  }
}
