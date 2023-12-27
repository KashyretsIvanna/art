import { PlanLimitName, PlanName } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class LimitsDtoReq {
  @IsEnum(PlanLimitName)
  limitName: PlanLimitName;

  @IsEnum(PlanName)
  planName: PlanName;

  @IsInt()
  @Min(1)
  @ValidateIf(
    (obj, value) =>
      (typeof obj.days === 'undefined' && typeof value === 'undefined') ||
      (value !== null && typeof value !== 'undefined')
  )
  limit?: number | null;

  @IsNumber()
  @IsInt()
  @Min(1)
  @IsOptional()
  days?: number | null;
}

export class LimitsSettingsReq {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => LimitsDtoReq)
  newLimits: LimitsDtoReq[];
}
