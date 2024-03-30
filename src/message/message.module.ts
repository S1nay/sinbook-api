import { Module } from '@nestjs/common';

import { ConversationModule } from '#conversation/conversation.module';

import { MessageService } from './message.service';

@Module({
  imports: [ConversationModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
