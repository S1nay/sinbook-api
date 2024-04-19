import { Injectable } from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';

import { PrismaService } from '#prisma/prisma.service';
import { UserService } from '#user/user.service';
import {
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
  transformFieldCount,
} from '#utils/helpers';
import {
  CommentsCountFields,
  PaginationResponse,
  Post,
  SelectPostCommentsCount,
} from '#utils/types';

import {
  CannotDeletePostException,
  CannotModifyPostException,
  PostNotFoundException,
} from './exceptions/post.exceptions';
import {
  CreatePostParams,
  DeletePostParams,
  EditPostParams,
  FindUserPostsParams,
} from './types/post.types';
import { transformPost } from './utils/post.utils';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createPost(params: CreatePostParams): Promise<Post> {
    const { content, userId, images } = params;

    const post = await this.prismaService.post.create({
      data: {
        content,
        images,
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: getShortUserFields() },
        _count: { select: { comments: true } },
      },
    });

    return transformPost(post);
  }

  async findPostById(id: number): Promise<PostModel> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: { select: getShortUserFields() },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      throw new PostNotFoundException();
    }

    return transformFieldCount<SelectPostCommentsCount, CommentsCountFields>(
      post,
      ['commentsCount'],
    );
  }

  async editPost(params: EditPostParams): Promise<Post> {
    const { content, id, userId, images } = params;

    const post = await this.findPostById(id);

    if (post.userId !== userId) {
      throw new CannotModifyPostException();
    }

    const updatedPost = await this.prismaService.post.update({
      where: { id },
      data: {
        content,
        images,
      },
      include: {
        _count: { select: { comments: true } },
        user: { select: getShortUserFields() },
      },
    });

    return transformPost(updatedPost);
  }

  async deletePost(params: DeletePostParams): Promise<void> {
    const { id, userId } = params;

    const post = await this.findPostById(id);

    if (post.userId !== userId) {
      throw new CannotDeletePostException();
    }

    await this.prismaService.post.delete({
      where: { id },
    });
  }

  async findPosts(
    params: FindUserPostsParams,
  ): Promise<PaginationResponse<Post>> {
    const { paginationParams, userId } = params;

    const userFilter = {
      ...(userId && { user: { id: userId } }),
    };
    const searchFilter = {
      ...(paginationParams.search && {
        content: { contains: paginationParams.search },
      }),
    };

    userId && (await this.userService.findUserById(userId));

    const { take, skip } = getPaginationParams(paginationParams);

    const posts = await this.prismaService.post.findMany({
      where: {
        AND: [searchFilter, userFilter],
      },
      include: {
        _count: { select: { comments: true } },
        user: { select: getShortUserFields() },
      },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
    });

    const totalPosts = await this.prismaService.post.count({
      where: { AND: [userFilter, searchFilter] },
    });

    const transformedPosts = posts.map((post) => transformPost(post));

    return {
      results: transformedPosts,
      meta: getPaginationMeta(paginationParams, totalPosts),
    };
  }
}
