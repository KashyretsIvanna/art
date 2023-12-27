import { Likes } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class ProfileIdReq {
  @IsNumber()
  @IsPositive()
  profileId: number;
}

export class FullLikesDto implements Omit<Likes, 'createdAt' | 'updatedAt'> {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  likedProfileId: number;

  @IsNotEmpty()
  @IsNumber()
  profileId: number;

  @IsNotEmpty()
  @IsBoolean()
  viewed: boolean;

  @IsNotEmpty()
  @IsDateString()
  expirationDate: Date;
}
