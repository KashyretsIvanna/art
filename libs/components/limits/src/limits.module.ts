import { SharedModule } from '@app/common/shared';
import { Module } from '@nestjs/common';

import { LimitsService } from './limits.service';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [LimitsService],
  exports: [LimitsService],
})
export class LimitsModule {}
