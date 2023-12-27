import { FullConfig } from '@app/common/configuration';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<FullConfig>) => ({
        transport: {
          service: 'gmail',
          host: 'smtp.gmail.com',
          secure: false,
          auth: {
            user: config.get('MAILER_USER'),
            pass: config.get('MAILER_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
