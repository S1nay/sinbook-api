import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { SocketAuthMiddleware } from '#auth/middlewares/websocket-auth.middleware';

import { ConversationsService } from './conversations.service';

@WebSocketGateway({ namespace: 'chats' })
export class ConversationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly conversationsService: ConversationsService) {}

  afterInit(socket: Socket) {
    socket.use(SocketAuthMiddleware() as never);
  }

  handleConnection(socket: Socket) {
    console.log(socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Disconnected ${socket.id}`);
  }

  @SubscribeMessage('message')
  sendMessage() {
    return 'Hello world!';
  }
}
