import { Injectable } from '@nestjs/common';
import { Comment as CommentModel } from '@prisma/client';

import { PostNotFoundException } from '#post/exceptions/post.exceptions';
import { PostService } from '#post/post.service';
import { PrismaService } from '#prisma/prisma.service';
import {
  createObjectByKeys,
  exclude,
  getPaginationMeta,
  getPaginationParams,
} from '#utils/helpers';
import { Comment, PaginationResponse, ShortUserInfo } from '#utils/types';

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
  ) {}

  private getCommentAuthor() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'avatarPath',
      'name',
      'nickName',
      'secondName',
    ]);
  }

  async findPostComments(
    params: FindAllByPostParams,
  ): Promise<PaginationResponse<Comment>> {
    const { paginationParams, postId } = params;

    const post = await this.postService.findPostById(postId);

    if (!post) {
      throw new PostNotFoundException();
    }

    const { take, skip } = getPaginationParams(paginationParams);

    const comments = await this.prismaService.comment.findMany({
      where: { postId },
      include: {
        user: { select: this.getCommentAuthor() },
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

    const post = await this.postService.findPostById(postId);

    if (!post) {
      throw new PostNotFoundException();
    }

    const comment = await this.prismaService.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
      include: {
        user: { select: this.getCommentAuthor() },
      },
    });

    return exclude(comment, ['postId', 'userId']);
  }

  async findCommentById(id: number): Promise<CommentModel> {
    const comment = await this.prismaService.comment.findFirst({
      where: { id },
    });

    return comment;
  }

  async editComment(params: EditCommentParams): Promise<Comment> {
    const { content, id, userId } = params;

    const comment = await this.findCommentById(id);

    if (!comment) {
      throw new CommentNotFoundException();
    }

    if (comment.userId !== userId) {
      throw new CannotDeleteCommentException();
    }

    const updatedComment = await this.prismaService.comment.update({
      where: { id },
      data: { content },
      include: {
        user: { select: this.getCommentAuthor() },
      },
    });

    return exclude(updatedComment, ['postId', 'userId']);
  }

  async deleteComment(params: DeleteCommentParams): Promise<void> {
    const { id, userId } = params;

    const comment = await this.findCommentById(id);

    if (!comment) {
      throw new CommentNotFoundException();
    }

    if (comment.userId !== userId) {
      throw new CannotDeleteCommentException();
    }

    await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
