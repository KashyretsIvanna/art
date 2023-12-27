import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { GenderType, Profile, UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class FullProfileDto
  implements
    Omit<
      Profile,
      | 'userId'
      | 'createdAt'
      | 'updatedAt'
      | 'role'
      | 'age'
      | 'gender'
      | 'galleryName'
      | 'profileDescription'
      | 'city'
      | 'country'
    >
{
  @IsBoolean()
  isTutorialShown: boolean;

  @IsString()
  registrationToken: string;

  @IsNumber()
  progress: number;

  @IsBoolean()
  isLookingForGallery: boolean;

  @IsBoolean()
  isLookingForArtist: boolean;

  @IsBoolean()
  isLookingForCollector: boolean;

  @IsNotEmpty()
  @IsNumber()
  id: number;

  @Min(18)
  @Max(100)
  @IsNumber()
  @ValidateIf((obj, value): boolean => {
    if (obj.role && [UserRole.ARTIST, UserRole.COLLECTOR].includes(obj.role)) {
      if (!value) {
        throw new BadRequestException('Age should exist');
      }

      return true;
    }

    return typeof value === 'number';
  })
  @IsOptional()
  age?: number | null;

  @ApiProperty({
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    enum: GenderType,
  })
  @IsEnum(GenderType)
  @ValidateIf((obj, value): boolean => {
    if (obj.role && [UserRole.ARTIST, UserRole.COLLECTOR].includes(obj.role)) {
      if (!value) {
        throw new BadRequestException('Gender should exist');
      }

      return true;
    }

    return typeof value === 'string';
  })
  @IsOptional()
  gender?: GenderType | null;

  @IsDateString()
  @IsNotEmpty()
  birthdate: Date | null;

  @IsNotEmpty()
  @IsString()
  aboutMe: string | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  country?: string | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city?: string | null;

  @IsNotEmpty()
  @MaxLength(40)
  @IsString()
  @ValidateIf((obj, value): boolean => {
    if (obj.role && [UserRole.GALLERY].includes(obj.role)) {
      if (!value) {
        throw new BadRequestException('Gallery name should exist');
      }

      return true;
    }

    return typeof value === 'string';
  })
  @IsOptional()
  galleryName?: string | null;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  @IsOptional()
  profileDescription?: string | null;

  @IsBoolean()
  autoLocation: boolean;

  @IsNotEmpty()
  @IsString()
  manualLocationCountry: string | null;

  @IsNotEmpty()
  @IsString()
  manualCity: string | null;

  @IsNumber()
  avatarId: number | null;
}
