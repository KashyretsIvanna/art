import { IsBoolean } from 'class-validator';

export class IsPremiumRes {
  @IsBoolean()
  isPremium: boolean;
}
