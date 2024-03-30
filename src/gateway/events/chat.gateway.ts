import { UseFilters, UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WebsocketExceptionsFilter } from '#utils/filters';
import { WSValidationPipe } from '#utils/pipes';
import { AuthenticatedSocket } from '#utils/interfaces';

@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new WSValidationPipe())
@WebSocketGateway({
  namespace: 'chat',
  transports: ['websocket'],
  cors: {
    allowedHeaders: ['Authorization'],
    origin: 'localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(socket: AuthenticatedSocket) {
    console.log(`User ${socket.user.nickName} is connected`);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`User ${socket.user.nickName} is disconnected`);
  }
}
