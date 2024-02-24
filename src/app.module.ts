import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { CoreModule } from './core/core.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [CoreModule, UserModule, AuthModule, PostModule, CommentModule],
})
export class AppModule {}
