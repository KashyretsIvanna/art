import { ProviderType } from '@prisma/client';
import { Request } from 'express';

export const appleUserName = 'Apple User';

export type JwtPayload = {
  sub: number;
};

export interface IUserAuthInfoRequest extends Request {
  user: {
    id: number;
  };
}

export type SocialProfileData = {
  email: string;
  name: string;
  providerType: ProviderType;
  providerUserId: string;
};

export type AppleAuthInfo = {
  email: string;
  sub: string;
  givenName: string;
  familyName: string;
};
