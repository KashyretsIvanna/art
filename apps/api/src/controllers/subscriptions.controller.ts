import {
  GetCurrentSubscriptionRes,
  GetSubscriptionStatusRes,
} from '@app/common/dto';
import { AccessTokenGuard, ReqUser } from '@app/common/shared';
import { SubscriptionsService } from '@app/components/subscriptions';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('/current')
  async getCurrentSubscription(
    @ReqUser() user: User
  ): Promise<GetCurrentSubscriptionRes> {
    return this.subscriptionsService.getCurrentSubscription(user.id);
  }

  @Get('/:subscriptionId')
  async getSubscriptionStatus(
    @Param('subscriptionId') subscriptionId: string
  ): Promise<GetSubscriptionStatusRes> {
    return this.subscriptionsService.getSubscriptionStatus(subscriptionId);
  }
}
