import { PrismaService } from '@app/common/prisma';
import { SharedModule, WsExceptionFilter } from '@app/common/shared';
import { StorageModule } from '@app/common/storage';
import { AuthModule } from '@app/components/auth';
import { NotificationsModule } from '@app/components/notifications';
import { DataFromSocketHelper, SocketManager } from '@app/components/websocket';
import { Module } from '@nestjs/common';

import { LikesService } from './likes.service';

@Module({
  imports: [StorageModule, SharedModule, AuthModule, NotificationsModule],
  providers: [
    PrismaService,
    SocketManager,
    WsExceptionFilter,
    DataFromSocketHelper,
    LikesService,
  ],
  exports: [LikesService],
})
export class LikesModule { }
