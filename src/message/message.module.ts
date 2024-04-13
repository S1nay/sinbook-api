import { Module } from '@nestjs/common';

import { ConversationModule } from '#conversation/conversation.module';

import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
  imports: [ConversationModule],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
