import {
  ArrayNotEmpty,
  ArrayUnique,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UnSubscribePresenceInfoReq {
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @IsOptional()
  profileIds: number[];
}
