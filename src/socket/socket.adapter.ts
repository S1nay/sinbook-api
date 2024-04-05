import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthService } from '#auth/auth.service';
import { NO_AUTH } from '#auth/constants/auth.constants';
import {
  HAS_NO_ACCESS_TO_CONVERSATION,
  INVALID_CONVERSATION_ID,
} from '#conversation/constants/conversation.constants';
import { ConversationService } from '#conversation/conversation.service';
import { AuthenticatedSocket } from '#utils/interfaces';

import { NAMESPACES } from './socket.namespaces';

export class WebsocketAdapter extends IoAdapter {
  private authService: AuthService;
  private conversationService: ConversationService;
  private readonly namespaces: string[] = [
    NAMESPACES.CONVERSATION,
    NAMESPACES.DIALOG,
  ];

  constructor(private readonly app: INestApplicationContext) {
    super(app);
    app.resolve<AuthService>(AuthService).then((authService) => {
      this.authService = authService;
    });

    app
      .resolve<ConversationService>(ConversationService)
      .then((conversationService) => {
        this.conversationService = conversationService;
      });
  }

  createIOServer(port: number, options?: unknown) {
    const server: Server = super.createIOServer(port, options);

    this.namespaces.forEach((namespace) => {
      server
        .of(namespace)
        .use(
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

              if (namespace === NAMESPACES.DIALOG) {
                const conversationId = +socket.handshake.query.conversationId;

                if (isNaN(conversationId)) {
                  next(new WsException(INVALID_CONVERSATION_ID));
                }

                const isHasAccess = await this.conversationService.hasAccess({
                  conversationId,
                  userId: userData.id,
                });

                if (!isHasAccess) {
                  next(new WsException(HAS_NO_ACCESS_TO_CONVERSATION));
                }
              }

              next();
            } catch {
              next(new WsException(NO_AUTH));
            }
          },
        );
    });

    return server;
  }
}
