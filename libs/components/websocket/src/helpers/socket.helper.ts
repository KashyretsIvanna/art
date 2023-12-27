import { AuthService } from '@app/components/auth';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class DataFromSocketHelper {
  constructor(private authService: AuthService) {}

  async getUserBySocket(client: Socket) {
    const accessToken = client.request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new WsException('Invalid token');
    }

    const user = await this.authService.findUserByToken(accessToken);
    if (!user || !user.profile) {
      throw new WsException('Forbidden');
    }

    return user;
  }
}
