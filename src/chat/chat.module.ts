import { Module } from '@nestjs/common';

import { ConversationModule } from '#conversation/conversation.module';
import { MessageModule } from '#message/message.module';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [ConversationModule, MessageModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
