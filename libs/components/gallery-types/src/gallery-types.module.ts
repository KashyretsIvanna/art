import { PrismaService } from '@app/common/prisma';
import { Module } from '@nestjs/common';

import { GalleryTypesService } from './gallery-types.service';

@Module({
  controllers: [],
  providers: [GalleryTypesService, PrismaService],
  exports: [GalleryTypesService],
})
export class GalleryTypesModule {}
