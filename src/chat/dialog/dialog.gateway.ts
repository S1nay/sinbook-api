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
import { ConversationService } from '#conversation/conversation.service';
import { WsUser } from '#decorators/ws-user.decorator';
import { WebsocketExceptionsFilter } from '#filters/ws-exception.filter';
import { CreateMessageDto } from '#message/dto/createMessage.dto';
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

  conversationId: string;

  afterInit(server: Server) {
    server.use(WsAuthMiddleware);
  }

  async handleConnection(socket: Socket) {
    const conversationId = +socket.handshake.query?.conversationId;

    if (isNaN(conversationId) || !conversationId)
      throw new WsException('conversationId должно быть числом');

    this.conversationId = 'chat-' + conversationId;

    const conversation =
      await this.conversationService.getConversationInfo(conversationId);

    socket.join(this.conversationId);

    socket.emit('get_conversation_info', conversation);
  }

  handleDisconnect(socket: Socket) {
    socket.leave(this.conversationId);
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

    const updatedConversation =
      await this.conversationService.setConversationLastMessage({
        conversationId: conversationId,
        messageId: createdMessage.id,
      });

    this.server.in(this.conversationId).emit('send_message', createdMessage);

    this.chatsServer.server
      .of('chats')
      .in(String(recipientId))
      .emit('send_message', updatedConversation);
  }
}
