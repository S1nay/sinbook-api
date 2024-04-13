import { Module } from '@nestjs/common';

import { ConversationModule } from '#conversation/conversation.module';

import { ConversationsGateway } from './gateways/conversations.gateway';
import { DialogGateway } from './gateways/dialog.gateway';
import { SocketSessionManager } from './socket.sessions';

@Module({
  imports: [ConversationModule],
  providers: [SocketSessionManager, ConversationsGateway, DialogGateway],
})
export class SocketModule {}
