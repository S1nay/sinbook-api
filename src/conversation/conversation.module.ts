import { Module } from '@nestjs/common';

import { UserModule } from '#user/user.module';

import { ConversationService } from './conversation.service';
import { ConversationsGateway } from './conversations.gateway';

@Module({
  imports: [UserModule],
  providers: [ConversationService, ConversationsGateway],
  exports: [ConversationService],
})
export class ConversationModule {}
