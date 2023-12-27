import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CreateRefundReq {
  @Type(() => Number)
  @IsInt()
  amount: number;
}
