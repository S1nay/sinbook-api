import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { UserModule } from '#user/user.module';

import { CheckAccessToConversation } from './middlewares/conversation.middleware';
import { ConversationService } from './conversation.service';

@Module({
  imports: [UserModule],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckAccessToConversation)
      .forRoutes({ path: 'conversations/:id', method: RequestMethod.GET });
  }
}
