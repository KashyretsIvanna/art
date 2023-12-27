import { MailModule } from '@app/common/mail';
import { SharedModule } from '@app/common/shared';
import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SmsService } from '../providers/sms.service';
import { TokensHelper } from '../providers/tokens.helper';
import { AccessTokenStrategy } from '../strategies/access-token.strategy';
import { RefreshTokenStrategy } from '../strategies/refresh-token.strategy';

@Module({
  imports: [SharedModule, MailModule],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TokensHelper,
    SmsService,
  ],
  exports: [AuthService, SmsService],
})
export class AuthModule {}
