import { SharedModule } from '@app/common/shared';
import { AuthModule } from '@app/components/auth';
import { Module } from '@nestjs/common';

import { DataFromSocketHelper } from './helpers';
import { SocketManager } from './managers';

@Module({
  imports: [SharedModule, AuthModule],
  providers: [SocketManager, DataFromSocketHelper],
  exports: [SocketManager, DataFromSocketHelper],
})
export class WebsocketModule {}
