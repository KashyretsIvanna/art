import { StorageModule } from '@app/common/storage';
import { Module } from '@nestjs/common';

import { FilesService } from './files.service';

@Module({
  imports: [StorageModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
