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
  SelectPost,
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
import {
  getPostFilters,
  transformArrayPosts,
  transformPost,
} from './utils/post.utils';

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
        likes: true,
      },
    });

    const transformedPost = transformPost(post);

    return {
      ...transformedPost,
      likes: transformedPost.likes.map((like) => like.userId),
    };
  }

  async findPostById(id: number): Promise<PostModel> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: { select: getShortUserFields() },
        _count: { select: { comments: true } },
        likes: true,
      },
    });

    if (!post) {
      throw new PostNotFoundException();
    }

    const transformedPost = transformFieldCount<
      SelectPost,
      CommentsCountFields
    >(post, ['commentsCount']);

    return transformedPost;
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
        likes: true,
      },
    });

    const transformedPost = transformPost(updatedPost);

    return {
      ...transformedPost,
      likes: updatedPost.likes.map((like) => like.userId),
    };
  }

  async deletePost(params: DeletePostParams): Promise<void> {
    const { id, userId } = params;

    const post = await this.findPostById(id);

    if (post.userId !== userId) {
      throw new CannotDeletePostException();
    }
    await this.prismaService.$transaction([
      this.prismaService.comment.deleteMany({ where: { postId: id } }),
      this.prismaService.like.deleteMany({ where: { postId: id } }),
      this.prismaService.post.delete({ where: { id } }),
    ]);
  }

  async findPosts(
    params: FindUserPostsParams,
  ): Promise<PaginationResponse<Post>> {
    const { userId } = params;

    userId && (await this.userService.findUserById(userId));

    const filters = getPostFilters(params);

    const { take, skip } = getPaginationParams(params);

    const posts = await this.prismaService.post.findMany({
      where: filters,
      include: {
        _count: { select: { comments: true } },
        user: { select: getShortUserFields() },
        likes: true,
      },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
    });

    const totalPosts = await this.prismaService.post.count({
      where: filters,
    });

    const transformedPosts = transformArrayPosts(posts);

    return {
      results: transformedPosts,
      meta: getPaginationMeta(params, totalPosts),
    };
  }
}
