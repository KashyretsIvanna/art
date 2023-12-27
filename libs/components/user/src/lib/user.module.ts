import { MailModule } from '@app/common/mail';
import { SharedModule } from '@app/common/shared';
import { SmsService } from '@app/components/auth';
import { GoogleMapsService } from '@app/components/google-maps';
import { ProfileModule } from '@app/components/profile';
import { Module } from '@nestjs/common';

import { UserService } from './user.service';

@Module({
  imports: [SharedModule, MailModule, ProfileModule],
  providers: [UserService, SmsService, GoogleMapsService],
  exports: [UserService],
})
export class UserModule {}
