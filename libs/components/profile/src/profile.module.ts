import { SharedModule } from '@app/common/shared';
import { StorageModule } from '@app/common/storage';
import { FilesModule } from '@app/components/files';
import { LikesService } from '@app/components/likes';
import { NotificationsModule } from '@app/components/notifications';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { CheckProfileHelper } from './lib/check-profile.helper';
import { HandleProfileErrorHelper } from './lib/handle-profile-error.helper';
import { ProfileProgressHelper } from './lib/profile-progress.helper';
import { ProfileService } from './profile.service';

@Module({
  imports: [SharedModule, FilesModule, StorageModule, NotificationsModule,CacheModule.register()],
  providers: [
    ProfileService,
    CheckProfileHelper,
    LikesService,
    HandleProfileErrorHelper,
    ProfileProgressHelper,
  ],
  exports: [ProfileService],
})
export class ProfileModule { }
