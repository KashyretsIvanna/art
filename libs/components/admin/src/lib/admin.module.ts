import { SharedModule } from '@app/common/shared';
import { Module } from '@nestjs/common';

import { AdminService } from './admin.service';

@Module({
  imports: [SharedModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
