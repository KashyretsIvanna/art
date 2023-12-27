import { PrismaService } from '@app/common/prisma';
import { Module } from '@nestjs/common';

import { ArtClassificationsService } from './art-classifications.service';

@Module({
  controllers: [],
  providers: [ArtClassificationsService, PrismaService],
  exports: [ArtClassificationsService],
})
export class ArtClassificationsModule {}
