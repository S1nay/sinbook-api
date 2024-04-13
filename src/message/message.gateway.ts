import { UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NAMESPACES } from 'adapters/socket.namespaces';
import { Namespace } from 'socket.io';

import { ConversationService } from '#conversation/conversation.service';
import { SocketSessionManager } from '#core/session.manager';
import { PrismaService } from '#prisma/prisma.service';
import { WebsocketExceptionsFilter } from '#utils/filters';
import { exclude } from '#utils/helpers';
import { AuthenticatedSocket } from '#utils/interfaces';
import { WSValidationPipe } from '#utils/pipes';

import { CreateMessageDto } from './dto/createMessage.dto';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { MessageService } from './message.service';

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
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly sessionManager: SocketSessionManager,
    private readonly prismaService: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
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
    const conversationId = +socket.handshake.query.conversationId;

    socket.join(`conversation-${conversationId}`);

    const conversation =
      await this.conversationService.getConversationById(conversationId);

    const isHaveUnreadedMessage = conversation.messages.filter(
      (message) => !message.isReaded,
    ).length;

    const isRecipient = conversation.recipient.id === socket.user.id;

    if (isRecipient && isHaveUnreadedMessage) {
      const conversation =
        await this.conversationService.checkUnreadMessages(conversationId);

      const recipient = this.sessionManager.getUserSocket(
        conversation.recipient.id,
      );
      const creator = this.sessionManager.getUserSocket(
        conversation.creator.id,
      );

      this.conversationServer
        .to(recipient.id)
        .to(creator.id)
        .emit('update_message_count', conversation);
    }

    socket.emit(
      'get_conversation_info',
      exclude(conversation, ['lastMessage', 'unreadMessagesCount']),
    );

    console.log(
      `User ${socket.user.nickName} is connected to conversation-${conversationId}`,
    );
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    socket.leave(`conversation-${socket.handshake.query.conversationId}`);

    console.log(
      `User ${socket.user.nickName} is disconnected to conversation-${socket.handshake.query.conversationId}`,
    );
  }

  @SubscribeMessage('create_message')
  async handleSendMessage(
    @MessageBody() body: CreateMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { content } = body;
    const conversationId = +socket.handshake.query.conversationId;

    const authorSocket = this.sessionManager.getUserSocket(socket.user.id);

    const chatRoom = this.dialogServer.adapter.rooms.get(
      `conversation-${conversationId}`,
    );

    const isAllInChatRoom = chatRoom.size > 1;

    const { message, conversation } = await this.messageService.createMessage({
      userId: socket.user.id,
      content,
      conversationId,
      isAllInChatRoom,
    });

    const recipientSocket =
      socket.user.id === conversation.creator.id
        ? this.sessionManager.getUserSocket(conversation.recipient.id)
        : this.sessionManager.getUserSocket(conversation.creator.id);

    this.dialogServer
      .in(`conversation-${conversation.id}`)
      .emit('send_message', message);

    this.conversationServer
      .to(authorSocket.id)
      .emit('new_message', conversation);

    if (recipientSocket) {
      this.conversationServer
        .to(recipientSocket.id)
        .emit('new_message', conversation);
    }
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @MessageBody() body: EditMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { content, messageId } = body;
    const conversationId = +socket.handshake.query.conversationId;

    const authorSocket = this.sessionManager.getUserSocket(socket.user.id);

    const editMessagePayload = await this.messageService.editMessage({
      content,
      conversationId,
      userId: socket.user.id,
      messageId,
    });

    const isWithConversation = 'conversation' in editMessagePayload;

    this.dialogServer
      .in(`conversation-${conversationId}`)
      .emit(
        'edit_message',
        isWithConversation ? editMessagePayload?.message : editMessagePayload,
      );

    if (isWithConversation) {
      const { conversation, message } = editMessagePayload;

      const recipientSocket =
        socket.user.id === conversation.creator.id
          ? this.sessionManager.getUserSocket(conversation.recipient.id)
          : this.sessionManager.getUserSocket(conversation.creator.id);

      if (message.id === conversation.lastMessage.id) {
        this.conversationServer
          .to(authorSocket.id)
          .emit('edit_message', conversation);

        if (recipientSocket) {
          this.conversationServer
            .to(recipientSocket.id)
            .emit('edit_message', conversation);
        }
      }
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody() body: DeleteMessageDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { messageId } = body;
    const conversationId = +socket.handshake.query.conversationId;

    const authorSocket = this.sessionManager.getUserSocket(socket.user.id);

    const { conversation, message } = await this.messageService.deleteMessage({
      conversationId,
      messageId,
      userId: socket.user.id,
    });

    const recipientSocket =
      socket.user.id === conversation.creator.id
        ? this.sessionManager.getUserSocket(conversation.recipient.id)
        : this.sessionManager.getUserSocket(conversation.creator.id);

    this.dialogServer
      .in(`conversation-${conversation.id}`)
      .emit('delete_message', message);

    this.conversationServer
      .to(authorSocket.id)
      .emit('delete_message', conversation);

    if (recipientSocket) {
      this.conversationServer
        .to(recipientSocket.id)
        .emit('delete_message', conversation);
    }
  }
}
