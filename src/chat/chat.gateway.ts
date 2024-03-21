import { ParseIntPipe } from '@nestjs/common';
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
import { ConversationService } from '#conversation/conversation.service';
import { WsUser } from '#decorators/ws-user.decorator';
import { CreateMessageDto } from '#message/dto/createMessage.dto';
import { MessageService } from '#message/message.service';

import { ChatService } from './chat.service';

@WebSocketGateway({
  path: '/chat',
  transports: ['websocket'],
  cors: {
    allowedHeaders: ['Authorization'],
    origin: 'localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(WsAuthMiddleware);
  }

  handleConnection(socket: Socket) {
    console.log(`Connected ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Disconnected ${socket.id}`);
  }

  @SubscribeMessage('create_conversation')
  async createConversation(
    @MessageBody('recipientId', ParseIntPipe) recipientId: number,
    @WsUser() userId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const conversations = await this.conversationService.createConversation({
      senderId: userId,
      recipientId,
    });

    socket.emit('create_conversation', conversations);
  }

  @SubscribeMessage('connect_to_dialog')
  async connectToDialog(
    @MessageBody('conversationId', ParseIntPipe) conversationId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const conversation =
      await this.conversationService.getConversationInfo(conversationId);

    socket.join(`chat-${conversationId}`);

    socket.emit('connect_to_dialog', conversation);
  }

  @SubscribeMessage('disconnect_from_dialog')
  async disconnectFromDialog(
    @MessageBody('conversationId', ParseIntPipe) conversationId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.leave(`chat-${conversationId}`);
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @WsUser() userId: number,
  ) {
    const { conversationId, recipientId } = createMessageDto;

    const message = await this.messageService.createMessage({
      ...createMessageDto,
      senderId: userId,
    });

    const updatedConversation =
      await this.conversationService.setConversationLastMessage(
        conversationId,
        message.id,
      );

    const recipient = await this.chatService.getRecipientSocketId(
      this.server,
      recipientId,
    );

    this.server.in(`chat-${conversationId}`).emit('send_message', message);

    this.server.in(recipient).emit('send_message', updatedConversation);
  }

  @SubscribeMessage('get_my_conversations')
  async getMyConversations(
    @WsUser() userId: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const conversations =
      await this.conversationService.getConversations(userId);
    console.log(socket.rooms);

    socket.emit('get_my_conversations', conversations);
  }
}
