import { CreateSubscriptionReq, CreateSubscriptionRes } from '@app/common/dto';
import { AccessComposition, ReqUser } from '@app/common/shared';
import { StripeService } from '@app/common/stripe';
import { RequestWithRawBody } from '@app/core/utils';
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Body,
  Get,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('stripe')
@ApiTags('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @AccessComposition()
  @Get('/payment-methods')
  async getPaymentMethods(@ReqUser() { id }: User) {
    return this.stripeService.getPaymentMethods(id);
  }

  @AccessComposition()
  @Post('/subscription')
  async createSubscription(
    @Body() { priceId, paymentMethodId }: CreateSubscriptionReq,
    @ReqUser() { id }: User
  ): Promise<CreateSubscriptionRes> {
    return this.stripeService.createSubscription(id, priceId, paymentMethodId);
  }

  @AccessComposition()
  @Get('/cancel-subscription')
  async cancelSubscription(@ReqUser() { id }: User) {
    return this.stripeService.cancelSubscription(id);
  }

  @Post('/webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RequestWithRawBody
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = await this.stripeService.constructEvent(
      signature,
      req.rawBody
    );

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.deleted'
    ) {
      return this.stripeService.processSubscriptionUpdate(event);
    }
  }

  @AccessComposition()
  @Get('subscription')
  async getSubscriptionsList(@ReqUser() { id }: User) {
    return this.stripeService.listSubscriptions(id);
  }
}
