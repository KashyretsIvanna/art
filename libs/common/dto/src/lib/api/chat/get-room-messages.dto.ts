import { IsNumber } from 'class-validator';

export class GetRoomMessagesReq {
  @IsNumber()
  roomId: number;

  @IsNumber()
  page: number;

  @IsNumber()
  take: number;
}
