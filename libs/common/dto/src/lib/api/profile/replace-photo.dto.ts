import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ReplaceProfilePhotoReq {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  order: number;
}
