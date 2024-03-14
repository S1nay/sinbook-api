import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

import { NO_AUTH } from '#auth/constants/auth.constants';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const socket: Socket = context.switchToWs().getClient();
    WsJwtAuthGuard.validateToken(socket);

    return true;
  }

  static validateToken(socket: Socket) {
    try {
      const { authorization } = socket.handshake.headers;
      const token = authorization.split(' ')[1];

      const userData = verify(token, new ConfigService().get('JWT_SECRET'));
      return userData;
    } catch (error) {
      throw new WsException(NO_AUTH);
    }
  }
}
