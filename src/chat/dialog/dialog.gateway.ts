import { UseFilters, UsePipes } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';

import { WsAuthMiddleware } from '#auth/middlewares/ws-auth.middleware';
import { SendUpdatedConversationParams } from '#chat/chats/types/chat.types';
import { ConversationService } from '#conversation/conversation.service';
import { WsUser } from '#decorators/ws-user.decorator';
import { WebsocketExceptionsFilter } from '#filters/ws-exception.filter';
import { CreateMessageDto } from '#message/dto/createMessage.dto';
import { DeleteMessageDto } from '#message/dto/deleteMessage.dto';
import { MessageService } from '#message/message.service';
import { WSValidationPipe } from '#pipes/ws-validation.pipe';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  namespace: 'dialog',
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
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @WebSocketServer()
  chatsServer: Namespace;

  @WebSocketServer()
  server: Namespace;

  afterInit(server: Server) {
    server.use(WsAuthMiddleware);
  }

  async handleConnection(socket: Socket) {
    const conversationId = +socket.handshake.query?.conversationId;

    if (isNaN(conversationId) || !conversationId)
      throw new WsException('conversationId должно быть числом');

    const conversation =
      await this.conversationService.getConversationInfo(conversationId);

    socket.join(`chat-${conversationId}`);

    socket.emit('get_conversation_info', conversation);
  }

  handleDisconnect(socket: Socket) {
    const conversationId = socket.handshake.query?.conversationId as string;

    socket.leave(conversationId);
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @WsUser() userId: number,
  ) {
    const { conversationId, recipientId } = createMessageDto;

    const createdMessage = await this.messageService.createMessage({
      ...createMessageDto,
      senderId: userId,
    });

    this.server
      .in(`chat-${conversationId}`)
      .emit('send_message', createdMessage);

    await this.conversationService.updateMessageCount({ conversationId });

    await this.sendUpdatedConversation({
      conversationId,
      recipientId,
      messageId: createdMessage.id,
      event: 'send_message',
    });
  }

  @SubscribeMessage('delete_message')
  async deleteMessage(@MessageBody() deleteMessageDto: DeleteMessageDto) {
    const { messageId, recipientId, conversationId } = deleteMessageDto;

    const deletedMessage = await this.messageService.deleteMessage(messageId);

    this.server
      .in(`chat-${conversationId}`)
      .emit('delete_message', deletedMessage);

    const lastMessage =
      await this.messageService.getLastConversationMessage(conversationId);

    await this.conversationService.updateMessageCount({
      conversationId,
      isDelete: true,
    });

    await this.sendUpdatedConversation({
      messageId: lastMessage[0]?.id,
      conversationId,
      recipientId,
      event: 'delete_message',
    });
  }

  async sendUpdatedConversation({
    conversationId,
    messageId,
    recipientId,
    event,
  }: SendUpdatedConversationParams) {
    const updatedConversation =
      await this.conversationService.setConversationLastMessage({
        conversationId: conversationId,
        messageId: messageId,
      });

    this.chatsServer.server
      .of('chats')
      .in(String(recipientId))
      .emit(event, updatedConversation);
  }
}
