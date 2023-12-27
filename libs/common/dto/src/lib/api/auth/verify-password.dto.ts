import { IsString } from 'class-validator';

export class VerifyPasswordReq {
  @IsString()
  password: string;
}

export class VerifyPasswordRes {
  isPasswordMatch: boolean;
}
