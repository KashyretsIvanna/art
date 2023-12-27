import { PickType } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

import { FullUserDto } from '../../common';

export class ResetPasswordReq extends PickType(FullUserDto, ['email']) {}

export class ResetPasswordConfirmationReq extends PickType(FullUserDto, [
  'password',
]) {
  @IsString()
  @Length(5)
  resetPasswordCode: string;
}

export class ResetPasswordCodeValidationReq {
  @IsString()
  @Length(5)
  resetPasswordCode: string;
}

export class ResetPasswordCodeValidationRes {
  isCodeValid: boolean;
}
