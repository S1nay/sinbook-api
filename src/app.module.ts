import { Module } from '@nestjs/common';

import { AuthModule } from '#auth/auth.module';
import { CommentModule } from '#comment/comment.module';
import { ConversationModule } from '#conversation/conversation.module';
import { CoreModule } from '#core/core.module';
import { FileModule } from '#file/file.module';
import { FollowsModule } from '#follows/follows.module';
import { LikeModule } from '#like/like.module';
import { MessageModule } from '#message/message.module';
import { NotificationModule } from '#notification/notification.module';
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
    LikeModule,
    NotificationModule,
  ],
})
export class AppModule {}
