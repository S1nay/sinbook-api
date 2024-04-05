import { Module } from '@nestjs/common';

import { ConversationsGateway } from './gateways/conversations.gateway';
import { DialogGateway } from './gateways/dialog.gateway';
import { SocketSessionManager } from './socket.sessions';

@Module({
  providers: [SocketSessionManager, ConversationsGateway, DialogGateway],
})
export class SocketModule {}
