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
import { Server, Socket } from 'socket.io';

import { WsAuthMiddleware } from '#auth/middlewares/ws-auth.middleware';
import { CreateConversationDto } from '#chat/chats/dto/createConversation.dto';
import { ConversationService } from '#conversation/conversation.service';
import { WsUser } from '#decorators/ws-user.decorator';
import { WebsocketExceptionsFilter } from '#filters/ws-exception.filter';
import { WSValidationPipe } from '#pipes/ws-validation.pipe';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  namespace: 'chats',
  transports: ['websocket'],
  cors: {
    allowedHeaders: ['Authorization'],
    origin: 'localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly conversationService: ConversationService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(WsAuthMiddleware);
  }

  handleConnection(socket: Socket) {
    socket.join(socket.data.userId);
  }

  handleDisconnect(socket: Socket) {
    socket.leave(socket.data.userId);
  }

  @SubscribeMessage('create_conversation')
  async createConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    createConversationDto: CreateConversationDto,
    @WsUser() userId: number,
  ) {
    const { recipientId } = createConversationDto;

    const conversations = await this.conversationService.createConversation({
      senderId: userId,
      recipientId: recipientId,
    });

    socket.emit('create_conversation', conversations);
  }

  @SubscribeMessage('get_my_conversations')
  async getMyConversations(
    @WsUser() userId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const conversations =
      await this.conversationService.getConversations(userId);

    socket.emit('get_my_conversations', conversations);
  }
}
