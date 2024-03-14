import { Module } from '@nestjs/common';

import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
