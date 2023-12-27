import { IsNumber, Min } from 'class-validator';

export class GiveSubscriptionReq {
  @IsNumber()
  @Min(1)
  userId: number;

  @IsNumber()
  @Min(1)
  amountDays: number;
}
