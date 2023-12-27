import { IsString } from 'class-validator';

export class SocialLoginReq {
  @IsString()
  accessToken: string;
}
