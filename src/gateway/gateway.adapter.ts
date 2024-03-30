import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';

import { AuthService } from '#auth/auth.service';
import { NO_AUTH } from '#auth/constants/auth.constants';
import { AuthenticatedSocket } from '#utils/interfaces';

export class WebsocketAdapter extends IoAdapter {
  private authService: AuthService;

  constructor(private app: INestApplicationContext) {
    super(app);
    app.resolve<AuthService>(AuthService).then((authService) => {
      this.authService = authService;
    });
  }

  createIOServer(port: number, options?: unknown) {
    const server = super.createIOServer(port, options);

    server.use(
      async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
        try {
          const authToken: string =
            socket.handshake.auth?.token ??
            socket.handshake.headers?.authorization;

          const [type, token] = authToken?.split(' ') ?? [];
          const bearerToken = type === 'Bearer' ? token : undefined;

          const userData =
            await this.authService.validateUserToken(bearerToken);

          socket.user = userData;
          next();
        } catch {
          next(new WsException(NO_AUTH));
        }
      },
    );

    return server;
  }
}
