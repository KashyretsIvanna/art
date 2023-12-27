import { SharedModule, WsExceptionFilter } from '@app/common/shared';
import { AuthModule } from '@app/components/auth';
import { ProfileModule } from '@app/components/profile';
import { DataFromSocketHelper, SocketManager } from '@app/components/websocket';
import { Module } from '@nestjs/common';

import { PresenceGateway } from './gateways/presence.gateway';
import { PresenceManager } from './managers/presence.manager';

@Module({
  imports: [SharedModule, AuthModule, ProfileModule],
  providers: [
    PresenceGateway,
    PresenceManager,
    SocketManager,
    DataFromSocketHelper,
    WsExceptionFilter,
  ],
})
export class PresenceModule {}
