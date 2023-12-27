import { IsString } from 'class-validator';

export class RefreshTokensReq {
  @IsString()
  refreshToken: string;
}
