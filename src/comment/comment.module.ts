import { Module } from '@nestjs/common';

import { PostModule } from '#post/post.module';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [PostModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
