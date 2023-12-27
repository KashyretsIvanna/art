import { ConfigurationModule } from '@app/common/configuration';
import { PrismaModule } from '@app/common/prisma';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigurationModule, PrismaModule, JwtModule],
  exports: [ConfigurationModule, PrismaModule, JwtModule],
})
export class SharedModule {}
