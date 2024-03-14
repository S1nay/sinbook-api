import { Socket } from 'socket.io';

import { WsJwtAuthGuard } from '#auth/guards/ws-jwt.guard';

type SocketIOMiddleware = {
  (socket: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleware => {
  return (socket, next) => {
    try {
      WsJwtAuthGuard.validateToken(socket);
      next();
    } catch (error) {
      next(error);
    }
  };
};
