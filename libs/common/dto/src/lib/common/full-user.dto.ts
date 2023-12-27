import { Role, User } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class FullUserDto
  implements Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'registrationToken'>
{
  @IsBoolean()
  isTrialUsed: boolean;

  @IsString()
  stripeCustomerId: string;

  @IsString()
  role: Role;

  @IsString()
  @Length(1, 30)
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters and have at least 1 special symbol, 1 number, 1 lowercase and 1 uppercase letter',
    }
  )
  password: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsBoolean()
  isEmailVerified: boolean;

  @IsBoolean()
  isPhoneVerified: boolean;
}
