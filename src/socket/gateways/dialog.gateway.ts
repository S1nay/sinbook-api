import { UseFilters, UsePipes } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';

import { ConversationService } from '#conversation/conversation.service';
import { PrismaService } from '#prisma/prisma.service';
import { NAMESPACES } from '#socket/socket.namespaces';
import { SocketSessionManager } from '#socket/socket.sessions';
import { WebsocketExceptionsFilter } from '#utils/filters';
import { AuthenticatedSocket } from '#utils/interfaces';
import { WSValidationPipe } from '#utils/pipes';
import { Conversation, Message } from '#utils/types';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  namespace: NAMESPACES.DIALOG,
  transports: ['websocket'],
  cors: {
    allowedHeaders: ['Authorization'],
    origin: 'localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class DialogGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly socketSessions: SocketSessionManager,
    private readonly prismaService: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  @WebSocketServer()
  conversationServer: Namespace;

  @WebSocketServer()
  dialogServer: Namespace;

  afterInit(namespace: Namespace) {
    this.conversationServer = namespace.server.of(NAMESPACES.CONVERSATION);
    this.dialogServer = namespace.server.of(NAMESPACES.DIALOG);
  }

  async handleConnection(socket: AuthenticatedSocket) {
    socket.join(`conversation-${socket.handshake.query.conversationId}`);

    const foundedConversation =
      await this.prismaService.conversation.findUnique({
        where: {
          id: +socket.handshake.query.conversationId,
        },
      });

    const isRecipient = foundedConversation.recipientId === socket.user.id;

    if (isRecipient) {
      const conversation = await this.conversationService.checkUnreadMessages(
        +socket.handshake.query.conversationId,
      );

      const recipient = this.socketSessions.getUserSocket(
        conversation.recipient.id,
      );
      const creator = this.socketSessions.getUserSocket(
        conversation.creator.id,
      );

      this.conversationServer
        .to(recipient.id)
        .to(creator.id)
        .emit('update_message_count', conversation);
    }

    console.log(
      `User ${socket.user.nickName} is connected to conversation-${socket.handshake.query.conversationId}`,
    );
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    socket.leave(`conversation-${socket.handshake.query.conversationId}`);

    console.log(
      `User ${socket.user.nickName} is disconnected to conversation-${socket.handshake.query.conversationId}`,
    );
  }

  @OnEvent('create.message')
  handleSendMessage(payload: { message: Message; conversation: Conversation }) {
    const { conversation, message } = payload;

    const recipientSocket = this.socketSessions.getUserSocket(
      conversation.recipient.id,
    );

    this.dialogServer
      .in(`conversation-${conversation.id}`)
      .emit('send_message', message);

    if (recipientSocket) {
      this.conversationServer
        .to(recipientSocket.id)
        .emit('new_message', conversation);
    }
  }

  @OnEvent('edit.message')
  handleEditMessage(payload: { message: Message; conversation: Conversation }) {
    const { message, conversation } = payload;

    const conversationId = conversation
      ? conversation.id
      : message.conversationId;

    this.dialogServer
      .in(`conversation-${conversationId}`)
      .emit('edit_message', message);

    if (conversation) {
      const recipientSocket = this.socketSessions.getUserSocket(
        conversation.recipient.id,
      );

      if (recipientSocket) {
        this.conversationServer
          .to(recipientSocket.id)
          .emit('edit_message', conversation);
      }
    }
  }

  @OnEvent('delete.message')
  handleDeleteMessage(payload: {
    message: Message;
    conversation: Conversation;
  }) {
    const { message, conversation } = payload;

    this.dialogServer
      .in(`conversation-${conversation.id}`)
      .emit('delete_message', message);

    const recipientSocket = this.socketSessions.getUserSocket(
      conversation.recipient.id,
    );

    if (recipientSocket) {
      this.conversationServer
        .to(recipientSocket.id)
        .emit('delete_message', conversation);
    }
  }
}
