import { Module } from '@nestjs/common';

import { PostModule } from '#post/post.module';

import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [PostModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
