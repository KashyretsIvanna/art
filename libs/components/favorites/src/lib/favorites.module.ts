import { PrismaService } from '@app/common/prisma';
import { NotificationsModule } from '@app/components/notifications';
import { Module } from '@nestjs/common';

import { FavoritesService } from './favorites.service';

@Module({
  imports: [NotificationsModule],
  providers: [FavoritesService, PrismaService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
