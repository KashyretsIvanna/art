import {
  SubscribePresenceInfoReq,
  UnSubscribePresenceInfoReq,
} from '@app/common/dto';
import { WsExceptionFilter } from '@app/common/shared';
import { ProfileService } from '@app/components/profile';
import { DataFromSocketHelper, SocketManager } from '@app/components/websocket';
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

import { PresenceManager } from '../managers/presence.manager';

enum PresenceStatuses {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

enum PresenceEvents {
  PRESENCE_CHANGE = 'presence-change',
  SUBSCRIBE_PRESENCE = 'subscribe-presence',
  REMOVE_SUBSCRIPTIONS = 'remove-subscriptions',
}

@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway(9001)
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //TODO : implement ability to subscribe multiple user collections

  @WebSocketServer()
  server: Server;

  constructor(
    private dataFromSocketHelper: DataFromSocketHelper,
    private socketManager: SocketManager,
    private presenceManager: PresenceManager,
    private wsExceptionFilter: WsExceptionFilter,
    private profileService: ProfileService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.dataFromSocketHelper.getUserBySocket(client);

      if (!user || !user.profile) {
        throw new WsException('Forbidden');
      }
      this.socketManager.addConnection(client, user.profile.id);

      const subscribers = this.presenceManager.getSubscribers(user.profile.id);

      if (subscribers) {
        for (const subscriber of subscribers) {
          subscriber.emit(PresenceEvents.PRESENCE_CHANGE, {
            data: [
              { profileId: user.profile.id, status: PresenceStatuses.ONLINE },
            ],
          });
        }
      }
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

  async handleDisconnect(client: Socket) {
    try {
      this.presenceManager.unSubscribeFromAll(client);

      const profileId = this.socketManager.getProfileIdBySocket(client);
      if (profileId) {
        this.socketManager.removeConnection(client);
        const userConnection =
          this.socketManager.getConnectionByProfileId(profileId);

        if (!userConnection) {
          const subscribers = this.presenceManager.getSubscribers(profileId);
          if (subscribers) {
            for (const subscriber of subscribers) {
              subscriber.emit(PresenceEvents.PRESENCE_CHANGE, {
                data: [{ profileId, status: PresenceStatuses.OFFLINE }],
              });
            }
          }
        }
      } else {
        throw new WsException('User not connected');
      }
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

  @SubscribeMessage(PresenceEvents.SUBSCRIBE_PRESENCE)
  async subscribePresence(
    @ConnectedSocket() client: Socket,
    @MessageBody() { profileIds }: SubscribePresenceInfoReq
  ) {
    const profiles = await this.profileService.getProfilesByProfileIds(
      profileIds
    );

    this.presenceManager.addSubscriptions(profileIds, client);

    client.emit(PresenceEvents.PRESENCE_CHANGE, {
      data: profiles.map((el) => ({
        profileId: el.id,
        status: this.socketManager.getConnectionByProfileId(el.id)
          ? PresenceStatuses.ONLINE
          : PresenceStatuses.OFFLINE,
      })),
    });
  }

  @SubscribeMessage(PresenceEvents.REMOVE_SUBSCRIPTIONS)
  async removeSubscriptions(
    @ConnectedSocket() client: Socket,
    @MessageBody() { profileIds }: UnSubscribePresenceInfoReq
  ) {
    if (profileIds) {
      this.presenceManager.unSubscribeSome(profileIds, client);
    } else {
      this.presenceManager.unSubscribeFromAll(client);
    }
  }
}
