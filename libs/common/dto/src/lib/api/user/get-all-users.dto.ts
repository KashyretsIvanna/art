import { PickType } from '@nestjs/swagger';
import { GenderType, PlanName, UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { FullUserDto } from '../../common';

export class AdminGetUserRes extends PickType(FullUserDto, ['name', 'email']) {
  id: number;
  city?: string;
  country?: string;
  gender?: GenderType;
  profileDescription?: string;
  plan?: PlanName;
  isLookingForArtist?: boolean;
  isLookingForGallery?: boolean;
  isLookingForCollector?: boolean;
  role?: UserRole;
  stripeCustomerId?: string;
}

export class GetAllUsersQueryReq {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  take?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsString()
  @Type(() => String)
  @IsOptional()
  search?: string;
}

export class GetAllUsersRes {
  users: AdminGetUserRes[];
  pages: number;
}
