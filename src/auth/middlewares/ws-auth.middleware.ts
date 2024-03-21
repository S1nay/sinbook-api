import { ConfigService } from '@nestjs/config';
import { JwtPayload, verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';

import { NO_AUTH } from '#auth/constants/auth.constants';

export const WsAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const authToken: string =
    socket.handshake.auth?.token ?? socket.handshake.headers?.authorization;

  const [type, token] = authToken?.split(' ') ?? [];
  const bearerToken = type === 'Bearer' ? token : undefined;

  const userData = verify(
    bearerToken,
    new ConfigService().get('JWT_SECRET'),
  ) as JwtPayload;

  socket.data = { ...socket.data, userId: userData.user_id };
  socket.join(String(userData.user_id));

  if (userData) {
    next();
  } else {
    next(new Error(NO_AUTH));
  }
};
