import { MatchWith } from '@app/core/utils';
import { IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordReq {
  @IsString()
  oldPassword: string;

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
  newPassword: string;

  @MatchWith<ChangePasswordReq>('newPassword')
  repeatNewPassword: string;
}
