import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';

import { PostService } from '#post/post.service';
import { PrismaService } from '#prisma/prisma.service';
import { exclude } from '#utils/excludeFields';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentNotFoundException } from './exceptions/comment.exceptions';

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

  async findCommentById(id: number): Promise<Comment> {
    const comment = await this.prismaService.comment.findFirst({
      where: { id },
    });

    if (!comment) {
      throw new CommentNotFoundException();
    }

    return comment;
  }

  async updateComment({
    updateCommentDto,
    id,
  }: {
    id: number;
    updateCommentDto: UpdateCommentDto;
  }): Promise<Omit<Comment, 'postId' | 'userId'>> {
    await this.findCommentById(id);

    const updatedComment = await this.prismaService.comment.update({
      where: { id },
      data: updateCommentDto,
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

    return exclude(updatedComment, ['postId', 'userId']);
  }

  async deleteComment(id: number): Promise<void> {
    await this.findCommentById(id);

    await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
