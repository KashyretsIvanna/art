import { SharedModule, WsExceptionFilter } from '@app/common/shared';
import { AuthModule } from '@app/components/auth';
import { DataFromSocketHelper, SocketManager } from '@app/components/websocket';
import { Module } from '@nestjs/common';

import { NotificationGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [SharedModule, AuthModule],
  providers: [
    NotificationsService,
    NotificationGateway,
    WsExceptionFilter,
    SocketManager,
    DataFromSocketHelper,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
