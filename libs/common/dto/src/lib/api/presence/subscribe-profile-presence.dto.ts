import { ArrayNotEmpty, ArrayUnique, IsNumber } from 'class-validator';

export class SubscribePresenceInfoReq {
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  profileIds: number[];
}
