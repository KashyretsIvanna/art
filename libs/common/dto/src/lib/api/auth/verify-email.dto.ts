import { IsString, Length } from 'class-validator';

export class VerifyEmailReq {
  @IsString()
  @Length(5)
  verificationCode: string;
}
