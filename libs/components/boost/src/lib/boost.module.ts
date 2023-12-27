import { PrismaService } from '@app/common/prisma';
import { NotificationsModule } from '@app/components/notifications';
import { Module } from '@nestjs/common';

import { BoostService } from './boost.service';

@Module({
  imports: [NotificationsModule],
  providers: [BoostService, PrismaService],
  exports: [BoostService],
})
export class BoostModule {}
