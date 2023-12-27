import { IsString } from 'class-validator';

export class AddPaymentMethodReq {
  @IsString()
  paymentMethodId: string;
}
