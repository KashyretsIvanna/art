import {
  CreateMessageReq,
  GetRoomMessagesReq,
  MarkMessageAsReadReq,
} from '@app/common/dto';
import { WsExceptionFilter } from '@app/common/shared';
import { SocketManager } from '@app/components/websocket';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from '../chat.service';

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway(9001, { maxHttpBufferSize: 1e8 })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private wsExceptionFilter: WsExceptionFilter,
    private socketManager: SocketManager
  ) {}

  async handleConnection(client: Socket) {
    try {
      const accessToken = client.request.headers.authorization?.split(' ')[1];
      if (!accessToken) {
        throw new WsException('Invalid token');
      }

      const user = await this.chatService.findUserByToken(accessToken);
      if (!user) {
        throw new WsException('Invalid token');
      }

      if (!user.profile) {
        throw new WsException('User has no profile');
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

  @SubscribeMessage('create-message')
  createMessage(
    @MessageBody() createMessageData: CreateMessageReq,
    @ConnectedSocket() client: Socket
  ) {
    return this.chatService.createMessage(createMessageData, client);
  }

  @SubscribeMessage('get-room-messages')
  getRoomMessages(
    @MessageBody() { roomId, ...pagination }: GetRoomMessagesReq,
    @ConnectedSocket() client: Socket
  ) {
    return this.chatService.getRoomMessages(
      roomId,
      client,
      pagination.page,
      pagination.take
    );
  }

  @SubscribeMessage('mark-as-read')
  markMessageAsRead(@MessageBody() { messageId }: MarkMessageAsReadReq) {
    return this.chatService.markMessageAsRead(messageId);
  }
}
