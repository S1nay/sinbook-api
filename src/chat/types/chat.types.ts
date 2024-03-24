import { Server } from 'socket.io';

export type GetRecipientSocketId = {
  server: Server;
  recipientId: number;
};
