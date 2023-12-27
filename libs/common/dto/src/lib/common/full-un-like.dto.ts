import { UnLikes } from '@prisma/client';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class FullUnLikesDto
  implements Omit<UnLikes, 'createdAt' | 'updatedAt'>
{
  @IsNotEmpty()
  @IsNumber()
  unLikedProfileId: number;

  @IsNotEmpty()
  @IsNumber()
  profileId: number;

  @IsNotEmpty()
  @IsDateString()
  unLikeDate: Date;

  @IsNotEmpty()
  @IsNumber()
  id: number;
}
