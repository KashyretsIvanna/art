import { CancelSubscriptionReq, GiveSubscriptionReq } from '@app/common/dto';
import { AccessTokenGuard, AdminGuard } from '@app/common/shared';
import { SubscriptionsService } from '@app/components/subscriptions';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('subscriptions')
@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('/grant')
  async giveSubscription(@Body() { userId, amountDays }: GiveSubscriptionReq) {
    return this.subscriptionsService.grantPremium(userId, false, amountDays);
  }

  @Post('/revoke')
  async revokeSubscription(@Body() { userId }: CancelSubscriptionReq) {
    return this.subscriptionsService.revokePremium(userId);
  }
}
