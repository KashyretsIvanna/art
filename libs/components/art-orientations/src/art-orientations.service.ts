import { PrismaService } from '@app/common/prisma';
import { ART_ORIENTATION } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { ArtOrientations } from '@prisma/client';

@Injectable()
export class ArtOrientationsService {
  constructor(private prisma: PrismaService) {}

  async getOrientations() {
    const names = ART_ORIENTATION.map((el) => el.orientationName);
    const entities = (await this.prisma.artOrientations.findMany({
      where: { orientationName: { in: names } },
    })) as ArtOrientations[];

    return entities;
  }
}
