import { SharedModule } from '@app/common/shared';
import { SubscriptionsModule } from '@app/components/subscriptions';
import { UserModule } from '@app/components/user';
import { Module } from '@nestjs/common';

import { StripeService } from './stripe.service';

@Module({
  imports: [SharedModule, SubscriptionsModule, UserModule],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
