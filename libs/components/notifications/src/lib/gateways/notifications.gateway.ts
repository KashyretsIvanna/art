import { DeleteNotification } from '@app/common/dto';
import { WsExceptionFilter } from '@app/common/shared';
import { DataFromSocketHelper, SocketManager } from '@app/components/websocket';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { NotificationsService } from '../notifications.service';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway(9001)
export class NotificationGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private notificationsService: NotificationsService,
    private socketManager: SocketManager,
    private wsExceptionFilter: WsExceptionFilter,
    private socketHelper: DataFromSocketHelper
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.socketHelper.getUserBySocket(client);
      if (!user || !user.profile) {
        throw new WsException('Forbidden');
      }
      this.socketManager.addConnection(client, user.profile.id);
    } catch (err) {
      this.wsExceptionFilter.catch(
        err as WsException,
        {
          switchToWs: () => ({
            getClient: () => client,
          }),
        } as any
      );

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.socketManager.removeConnection(client);
  }

  @SubscribeMessage('delete-notification')
  deleteNotification(@MessageBody() { notificationId }: DeleteNotification) {
    return this.notificationsService.deleteNotification(notificationId);
  }
}
