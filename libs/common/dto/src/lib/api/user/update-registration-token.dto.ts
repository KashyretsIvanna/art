import { IsString } from 'class-validator';

export class UpdateRegistrationTokenReq {
  @IsString()
  registrationToken: string;
}
