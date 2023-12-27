import { PrismaService } from '@app/common/prisma';
import { Module } from '@nestjs/common';

import { ArtOrientationsService } from './art-orientations.service';

@Module({
  controllers: [],
  providers: [ArtOrientationsService, PrismaService],
  exports: [ArtOrientationsService],
})
export class ArtOrientationsModule {}
