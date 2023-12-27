import { IsString } from 'class-validator';

export class CreateSubscriptionReq {
  @IsString()
  priceId: string;

  @IsString()
  paymentMethodId: string;
}

export class CreateSubscriptionRes {
  customerId: string;
  ephemeralKey: string;
  subscriptionId: string;
}
