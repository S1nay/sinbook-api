import { Module } from '@nestjs/common';

import { ConversationsGateway } from './conversations.gateway';
import { ConversationsService } from './conversations.service';

@Module({
  providers: [ConversationsGateway, ConversationsService],
})
export class ConversationsModule {}
