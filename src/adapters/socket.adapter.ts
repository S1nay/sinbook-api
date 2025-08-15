import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { NAMESPACES } from 'adapters/socket.namespaces';
import { Server } from 'socket.io';

import { AuthService } from '#auth/auth.service';
import { NO_AUTH } from '#auth/constants/auth.constants';
import {
  HAS_NO_ACCESS_TO_CONVERSATION,
  INVALID_CONVERSATION_ID,
} from '#conversation/constants/conversation.constants';
import { ConversationService } from '#conversation/conversation.service';
import { SocketSessionManager } from '#core/session.manager';
import { AuthenticatedSocket } from '#utils/interfaces';

export class WebsocketAdapter extends IoAdapter {
  private authService: AuthService;
  private conversationService: ConversationService;
  private sessionManager: SocketSessionManager;

  private readonly namespaces: string[] = [
    NAMESPACES.CONVERSATION,
    NAMESPACES.DIALOG,
    NAMESPACES.NOTIFICATIONS,
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

    app
      .resolve<SocketSessionManager>(SocketSessionManager)
      .then((sessionManager) => {
        this.sessionManager = sessionManager;
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
              const authToken: string = socket.handshake.headers?.authorization;

              const userData =
                await this.authService.validateUserToken(authToken);

              socket.user = userData;

              if (namespace === NAMESPACES.DIALOG) {
                const connectedSocket = this.sessionManager.getUserSocket(
                  socket.user.id,
                );

                if (!connectedSocket) {
                  throw new WsException('Нет подключения');
                }
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
