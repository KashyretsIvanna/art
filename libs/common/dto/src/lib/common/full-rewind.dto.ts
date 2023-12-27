import { ActionType, Rewinds } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class FullRewindDto implements Omit<Rewinds, 'createdAt' | 'updatedAt'> {
  @IsNumber()
  @IsNotEmpty()
  rewoundProfileId: number;

  @IsNumber()
  @IsNotEmpty()
  profileId: number;

  @IsEnum(ActionType)
  actionType: ActionType;

  @IsNotEmpty()
  @IsNumber()
  id: number;
}
