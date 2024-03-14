import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { WsJwtAuthGuard } from '#auth/guards/ws-jwt.guard';
import { SocketAuthMiddleware } from '#auth/middlewares/websocket-auth.middleware';

import { ChatsService } from './chats.service';

@WebSocketGateway({ namespace: 'chats' })
@UseGuards(WsJwtAuthGuard)
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly chatsService: ChatsService) {}

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
