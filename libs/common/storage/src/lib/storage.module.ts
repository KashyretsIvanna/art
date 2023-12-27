import { SharedModule } from '@app/common/shared';
import { Module } from '@nestjs/common';

import { StorageService } from './storage.service';

@Module({
  imports: [SharedModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
