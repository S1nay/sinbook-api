import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';

import { PostService } from '#post/post.service';
import { PrismaService } from '#prisma/prisma.service';
import { exclude } from '#utils/excludeFields';

import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postService: PostService,
  ) {}

  async findPostComments(
    postId: number,
  ): Promise<Omit<Comment, 'postId' | 'userId'>[]> {
    await this.postService.findPostById(postId);

    const comments = await this.prismaService.comment.findMany({
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            secondName: true,
            nickName: true,
          },
        },
      },
    });

    return comments.map((comment) => exclude(comment, ['postId', 'userId']));
  }

  async createComment({
    userId,
    postId,
    createCommentDto,
  }: {
    userId: number;
    postId: number;
    createCommentDto: CreateCommentDto;
  }): Promise<Omit<Comment, 'postId' | 'userId'>> {
    await this.postService.findPostById(postId);

    const comment = await this.prismaService.comment.create({
      data: {
        ...createCommentDto,
        user: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            secondName: true,
            nickName: true,
          },
        },
      },
    });

    return exclude(comment, ['postId', 'userId']);
  }
}
