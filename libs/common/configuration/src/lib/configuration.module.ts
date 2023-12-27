import { validateConfig } from '@app/core/utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FullConfig } from './full-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig(FullConfig),
      envFilePath: '.development.env',
    }),
  ],
})
export class ConfigurationModule {}
