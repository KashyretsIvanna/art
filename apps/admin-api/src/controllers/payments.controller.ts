import { CreateRefundReq, GetPaymentsReq } from '@app/common/dto';
import {
  AccessTokenGuard,
  AdminGuard,
  ValidatedQuery,
} from '@app/common/shared';
import { StripeService } from '@app/common/stripe';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('payments')
@ApiTags('payments')
@UseGuards(AccessTokenGuard, AdminGuard)
export class PaymentsController {
  constructor(private stripeService: StripeService) {}

  @Get('/')
  @ApiBearerAuth()
  async getPayments(
    @ValidatedQuery() { startAfter, endBefore, limit, search }: GetPaymentsReq
  ) {
    const payments = await this.stripeService.getPayments({
      limit,
      startAfter,
      endBefore,
      search,
    });

    return payments;
  }

  @Get('/:paymentId')
  @ApiBearerAuth()
  async getPayment(@Param('paymentId') paymentId: string) {
    const payment = await this.stripeService.getPayment(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  @Post('/:paymentId/refund')
  @ApiBearerAuth()
  async refundPayment(
    @Param('paymentId') paymentId: string,
    @Body() { amount }: CreateRefundReq
  ) {
    return this.stripeService.refundPayment(paymentId, amount);
  }
}
