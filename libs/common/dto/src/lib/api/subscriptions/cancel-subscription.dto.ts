import { IsNumber, Min } from 'class-validator';

export class CancelSubscriptionReq {
  @IsNumber()
  @Min(1)
  userId: number;
}
