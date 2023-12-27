import { PrismaService } from '@app/common/prisma';
import { GALLERY_TYPES } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { GalleryTypes } from '@prisma/client';

@Injectable()
export class GalleryTypesService {
  constructor(private prisma: PrismaService) {}

  async getGalleryTypes() {
    const names = GALLERY_TYPES.map((el) => el.typeName);
    const entities = (await this.prisma.galleryTypes.findMany({
      where: { typeName: { in: names } },
    })) as GalleryTypes[];

    return entities;
  }
}
