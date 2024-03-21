import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class ChatService {
  async getRecipientSocketId(server: Server, recipientId: number) {
    const sockets = await server.fetchSockets();

    const recipient = sockets.find(
      (socket) => socket.data.userId === recipientId,
    );

    return String(recipient.data.userId);
  }
}
