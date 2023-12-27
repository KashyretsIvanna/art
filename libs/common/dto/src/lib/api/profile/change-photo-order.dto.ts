import { ArrayUnique, IsArray, IsNumber } from 'class-validator';

export class ChangePhotoOrderReq {
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayUnique()
  orderedIds: number[];
}
