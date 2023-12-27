import { SharedModule, WsExceptionFilter } from '@app/common/shared';
import { StorageModule } from '@app/common/storage';
import { FilesModule } from '@app/components/files';
import { LikesService } from '@app/components/likes';
import { NotificationsModule } from '@app/components/notifications';
import { SocketManager } from '@app/components/websocket';
import { Module } from '@nestjs/common';

import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  imports: [SharedModule, FilesModule, StorageModule, NotificationsModule],
  providers: [
    ChatService,
    ChatGateway,
    WsExceptionFilter,
    SocketManager,
    LikesService,
  ],
  exports: [ChatService],
})
export class ChatModule {}
