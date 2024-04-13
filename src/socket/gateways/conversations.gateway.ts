import { UseFilters, UsePipes } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { SocketSessionManager } from 'socket/socket.sessions';

import { NAMESPACES } from '#socket/socket.namespaces';
import { WebsocketExceptionsFilter } from '#utils/filters';
import { AuthenticatedSocket } from '#utils/interfaces';
import { WSValidationPipe } from '#utils/pipes';
import { Conversation } from '#utils/types';

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
  constructor(private readonly socketSessions: SocketSessionManager) {}

  handleConnection(socket: AuthenticatedSocket) {
    console.log(`User ${socket.user.nickName} is connected to conversations`);

    this.socketSessions.setUserSocket(socket.user.id, socket);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log(
      `User ${socket.user.nickName} is disconnected from conversations`,
    );
    this.socketSessions.removeUserSocket(socket.user.id);
  }

  @OnEvent('create.conversation')
  getNewConversation(body: Conversation) {
    const recipientId = body.recipient.id;

    const recipientSocket = this.socketSessions.getUserSocket(recipientId);

    if (recipientSocket) recipientSocket.emit('new_conversation', body);
  }
}
