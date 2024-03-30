import { Module } from '@nestjs/common';

import { ConversationModule } from '#conversation/conversation.module';
import { MessageModule } from '#message/message.module';

import { ChatGateway } from './events/chat.gateway';
import { GatewaySessionManager } from './gateway.sessions';

@Module({
  imports: [ConversationModule, MessageModule],
  providers: [ChatGateway, GatewaySessionManager],
})
export class ChatModule {}
