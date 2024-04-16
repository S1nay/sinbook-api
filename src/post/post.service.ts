import { Injectable } from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';

import { PrismaService } from '#prisma/prisma.service';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { UserService } from '#user/user.service';
import {
  createObjectByKeys,
  exclude,
  getPaginationMeta,
  getPaginationParams,
  transformFieldCount,
} from '#utils/helpers';
import {
  CommentsCountFields,
  PaginationResponse,
  Post,
  SelectPostCommentsCount,
  ShortUserInfo,
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

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  private getPostUserFields() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'nickName',
      'secondName',
      'avatarPath',
    ]);
  }

  private transformPost(post: SelectPostCommentsCount) {
    const transformedPost = transformFieldCount<
      SelectPostCommentsCount,
      CommentsCountFields
    >(post, ['commentsCount']);

    return exclude(transformedPost, ['userId']);
  }

  async createPost(params: CreatePostParams): Promise<Post> {
    const { content, userId, images } = params;

    const post = await this.prismaService.post.create({
      data: {
        content,
        images,
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: this.getPostUserFields() },
        _count: { select: { comments: true } },
      },
    });

    return this.transformPost(post);
  }

  async findPostById(id: number): Promise<PostModel> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: { select: this.getPostUserFields() },
        _count: { select: { comments: true } },
      },
    });

    return transformFieldCount<SelectPostCommentsCount, CommentsCountFields>(
      post,
      ['commentsCount'],
    );
  }

  async editPost(params: EditPostParams): Promise<Post> {
    const { content, id, userId, images } = params;

    const post = await this.findPostById(id);

    if (!post) {
      throw new PostNotFoundException();
    }

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
        user: { select: this.getPostUserFields() },
      },
    });

    return this.transformPost(updatedPost);
  }

  async deletePost(params: DeletePostParams): Promise<void> {
    const { id, userId } = params;

    const post = await this.findPostById(id);

    if (!post) {
      throw new PostNotFoundException();
    }

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

    if (userId) {
      const user = await this.userService.findUserById(userId);

      if (!user) throw new UserNotFoundException();
    }

    const { take, skip } = getPaginationParams(paginationParams);

    const posts = await this.prismaService.post.findMany({
      where: {
        AND: [searchFilter, userFilter],
      },
      include: {
        _count: { select: { comments: true } },
        user: { select: this.getPostUserFields() },
      },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
    });

    const totalPosts = await this.prismaService.post.count({
      where: { AND: [userFilter, searchFilter] },
    });

    const transformedPosts = posts.map((post) => this.transformPost(post));

    return {
      results: transformedPosts,
      meta: getPaginationMeta(paginationParams, totalPosts),
    };
  }
}
