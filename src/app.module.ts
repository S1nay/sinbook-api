import { Module } from '@nestjs/common';

import { AuthModule } from '#auth/auth.module';
import { CommentModule } from '#comment/comment.module';
import { ConversationModule } from '#conversation/conversation.module';
import { CoreModule } from '#core/core.module';
import { FileModule } from '#file/file.module';
import { FollowsModule } from '#follows/follows.module';
import { MessageModule } from '#message/message.module';
import { PostModule } from '#post/post.module';
import { UserModule } from '#user/user.module';

@Module({
  imports: [
    CoreModule,
    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    FileModule,
    MessageModule,
    ConversationModule,
    FollowsModule,
  ],
})
export class AppModule {}
