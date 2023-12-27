import { MailModule } from '@app/common/mail';
import { SharedModule } from '@app/common/shared';
import { ProfileModule } from '@app/components/profile';
import { Module } from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [SharedModule, ProfileModule, MailModule],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
