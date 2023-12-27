import { IsNumber } from 'class-validator';

export class MarkMessageAsReadReq {
  @IsNumber()
  messageId: number;
}
