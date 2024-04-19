import { Injectable } from '@nestjs/common';

import { PostService } from '#post/post.service';
import { transformPost } from '#post/utils/post.utils';
import { PrismaService } from '#prisma/prisma.service';
import { getShortUserFields } from '#utils/helpers';
import { Post } from '#utils/types';

import { CheckLikeParams, LikePostParams } from './types/like.types';

@Injectable()
export class LikeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postService: PostService,
  ) {}

  async likePost(params: LikePostParams): Promise<Post> {
    const { postId } = params;

    await this.postService.findPostById(postId);

    const like = await this.checkLike(params);

    if (like) {
      return this.deleteLike(params);
    } else {
      return this.createLike(params);
    }
  }

  async createLike(params: LikePostParams): Promise<Post> {
    const { postId, userId } = params;

    const like = await this.prismaService.like.create({
      data: {
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
      include: {
        post: {
          include: {
            user: { select: getShortUserFields() },
            _count: { select: { comments: true } },
            likes: true,
          },
        },
      },
    });

    const transformedPost = transformPost(like.post);

    return {
      ...transformedPost,
      likes: [...transformedPost.likes.map((like) => like.userId)],
    };
  }

  async deleteLike(params: LikePostParams): Promise<Post> {
    const { userId, postId } = params;

    const like = await this.prismaService.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      include: {
        post: {
          include: {
            user: { select: getShortUserFields() },
            _count: { select: { comments: true } },
            likes: true,
          },
        },
      },
    });

    const transformedPost = transformPost(like.post);

    return {
      ...transformedPost,
      likes: [
        ...transformedPost.likes
          .filter((like) => like.userId !== userId)
          .map((like) => like.userId),
      ],
    };
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
