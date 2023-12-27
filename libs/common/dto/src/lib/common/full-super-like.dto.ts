import { SuperLikes } from '@prisma/client';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FullSuperLikesDto
  implements Omit<SuperLikes, 'createdAt' | 'updatedAt'>
{
  @IsNotEmpty()
  @IsNumber()
  profileId: number;

  @IsNotEmpty()
  @IsNumber()
  superLikedProfileId: number;

  @IsNotEmpty()
  @IsNumber()
  id: number;
}
