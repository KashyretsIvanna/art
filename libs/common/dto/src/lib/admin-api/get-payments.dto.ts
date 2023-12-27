import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetPaymentsReq {
  @IsOptional()
  @IsString()
  startAfter?: string;

  @IsOptional()
  @IsString()
  endBefore?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsString()
  @IsOptional()
  search?: string;
}
