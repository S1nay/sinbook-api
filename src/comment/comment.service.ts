import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Comment as CommentModel } from '@prisma/client';

import { PostService } from '#post/post.service';
import { PrismaService } from '#prisma/prisma.service';
import {
  exclude,
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
} from '#utils/helpers';
import { Comment, PaginationResponse } from '#utils/types';

import {
  CannotDeleteCommentException,
  CommentNotFoundException,
} from './exceptions/comment.exceptions';
import {
  CreateCommentParams,
  DeleteCommentParams,
  EditCommentParams,
  FindAllByPostParams,
} from './types/comment.types';

@Injectable()
export class CommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly postService: PostService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findPostComments(
    params: FindAllByPostParams,
  ): Promise<PaginationResponse<Comment>> {
    const { paginationParams, postId } = params;

    await this.postService.findPostById(postId);

    const { take, skip } = getPaginationParams(paginationParams);

    const comments = await this.prismaService.comment.findMany({
      where: { postId },
      include: {
        user: { select: getShortUserFields() },
      },
      take,
      skip,
    });

    const totalComments = await this.prismaService.comment.count({
      where: { postId },
    });

    const transformedComments = comments.map((comment) =>
      exclude(comment, ['postId', 'userId']),
    );

    return {
      results: transformedComments,
      meta: getPaginationMeta(paginationParams, totalComments),
    };
  }

  async createComment(params: CreateCommentParams): Promise<Comment> {
    const { content, postId, userId } = params;

    await this.postService.findPostById(postId);

    const comment = await this.prismaService.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
      include: {
        user: { select: getShortUserFields() },
        post: { select: { id: true, userId: true } },
      },
    });

    this.eventEmitter.emit('create_notification', {
      authorId: userId,
      recipientId: comment.post.userId,
      typeEntityId: comment.post.id,
      type: 'comment',
    });

    return exclude(comment, ['postId', 'userId', 'post']);
  }

  async findCommentById(id: number): Promise<CommentModel> {
    const comment = await this.prismaService.comment.findFirst({
      where: { id },
    });

    if (!comment) {
      throw new CommentNotFoundException();
    }

    return comment;
  }

  async editComment(params: EditCommentParams): Promise<Comment> {
    const { content, id, userId } = params;

    const comment = await this.findCommentById(id);

    if (comment.userId !== userId) {
      throw new CannotDeleteCommentException();
    }

    const updatedComment = await this.prismaService.comment.update({
      where: { id },
      data: { content },
      include: {
        user: { select: getShortUserFields() },
      },
    });

    return exclude(updatedComment, ['postId', 'userId']);
  }

  async deleteComment(params: DeleteCommentParams): Promise<void> {
    const { id, userId } = params;

    const comment = await this.findCommentById(id);

    if (comment.userId !== userId) {
      throw new CannotDeleteCommentException();
    }

    await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
