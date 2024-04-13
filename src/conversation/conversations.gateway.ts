import { UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NAMESPACES } from 'adapters/socket.namespaces';
import { Namespace } from 'socket.io';

import { SocketSessionManager } from '#core/session.manager';
import { WebsocketExceptionsFilter } from '#utils/filters';
import { AuthenticatedSocket } from '#utils/interfaces';
import { WSValidationPipe } from '#utils/pipes';

import { CreateConversationDto } from './dto/createConversation.dto';
import { ConversationService } from './conversation.service';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  namespace: NAMESPACES.CONVERSATION,
  transports: ['websocket'],
  cors: {
    allowedHeaders: ['Authorization'],
    origin: 'localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ConversationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly sessionManager: SocketSessionManager,
    private readonly conversationService: ConversationService,
  ) {}

  @WebSocketServer()
  conversationServer: Namespace;

  afterInit(namespace: Namespace) {
    this.conversationServer = namespace.server.of(NAMESPACES.CONVERSATION);
  }

  async handleConnection(socket: AuthenticatedSocket) {
    console.log(`User ${socket.user.nickName} is connected to conversations`);

    const conversations = await this.conversationService.getConversations(
      +socket.user.id,
    );

    this.sessionManager.setUserSocket(socket.user.id, socket);

    this.conversationServer
      .to(socket.id)
      .emit('get_conversations', conversations);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(
      `User ${socket.user.nickName} is disconnected from conversations`,
    );
    this.sessionManager.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('create_conversation')
  async createNewConversation(
    @MessageBody() body: CreateConversationDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { message, recipientId } = body;

    const conversation = await this.conversationService.createConversation({
      message,
      recipientId,
      creatorId: socket.user.id,
    });

    const recipientSocket = this.sessionManager.getUserSocket(recipientId);

    if (recipientSocket) recipientSocket.emit('new_conversation', conversation);
  }
}
