import { Boosts } from '@prisma/client';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class FullBoostDto implements Omit<Boosts, 'createdAt' | 'updatedAt'> {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  profileId: number;

  @IsNotEmpty()
  @IsDateString()
  startTime: Date;
  
  @IsNotEmpty()
  @IsDateString()
  endTime: Date;
}
