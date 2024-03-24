import { Module } from '@nestjs/common';

import { ConversationModule } from '#conversation/conversation.module';
import { MessageModule } from '#message/message.module';

import { ChatsGateway } from './chats/chats.gateway';
import { DialogGateway } from './dialog/dialog.gateway';

@Module({
  imports: [ConversationModule, MessageModule],
  providers: [ChatsGateway, DialogGateway],
})
export class ChatModule {}
