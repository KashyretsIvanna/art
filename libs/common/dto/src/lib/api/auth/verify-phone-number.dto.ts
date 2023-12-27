import { Length } from 'class-validator';

export class VerifyPhoneNumberReq {
  @Length(6)
  verificationCode: string;
}
