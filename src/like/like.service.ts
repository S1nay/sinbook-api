import { Injectable } from '@nestjs/common';

import { PostNotFoundException } from '#post/exceptions/post.exceptions';
import { PostService } from '#post/post.service';
import { PrismaService } from '#prisma/prisma.service';

import { CheckLikeParams, LikePostParams } from './types/like.types';

@Injectable()
export class LikeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postService: PostService,
  ) {}

  async likePost({ userId, postId }: LikePostParams): Promise<void> {
    const post = await this.postService.findPostById(postId);

    if (!post) throw new PostNotFoundException();

    const like = await this.checkLike({ postId, userId });

    if (like) {
      await this.prismaService.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return;
    }

    await this.prismaService.like.create({
      data: {
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
    });
  }

  async checkLike({ userId, postId }: CheckLikeParams): Promise<boolean> {
    const like = await this.prismaService.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return like ? true : false;
  }
}
