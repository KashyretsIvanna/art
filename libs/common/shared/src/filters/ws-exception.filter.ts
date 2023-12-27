import {
  ArgumentsHost,
  Catch,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  override catch(
    exception: WsException | HttpException,
    host: ArgumentsHost
  ): void {
    const client = host.switchToWs().getClient<Socket>();

    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();

    const details = error instanceof Object ? { ...error } : { message: error };

    client.emit('error', {
      id: client.id,
      ...details,
    });
  }
}
