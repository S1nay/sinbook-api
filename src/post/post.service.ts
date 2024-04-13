import { Injectable } from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';

import { PrismaService } from '#prisma/prisma.service';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { UserService } from '#user/user.service';
import {
  createObjectByKeys,
  exclude,
  transformFieldCount,
} from '#utils/helpers';
import {
  CommentsCountFields,
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

    const postWithCommentsCount = transformFieldCount<
      SelectPostCommentsCount,
      CommentsCountFields
    >(post, ['commentsCount']);

    return exclude(postWithCommentsCount, ['userId']);
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

    const postWithCommentsCount = transformFieldCount<
      SelectPostCommentsCount,
      CommentsCountFields
    >(updatedPost, ['commentsCount']);

    return exclude(postWithCommentsCount, ['userId']);
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

  async findShortUserInfos(userId: number): Promise<Post[]> {
    const user = await this.userService.findUserById(userId);

    if (!user) throw new UserNotFoundException();

    const posts = await this.prismaService.post.findMany({
      where: { userId },
      include: {
        _count: { select: { comments: true } },
        user: { select: this.getPostUserFields() },
      },
    });

    const postsWithCommentsCount = posts.map((post) =>
      transformFieldCount<SelectPostCommentsCount, CommentsCountFields>(post, [
        'commentsCount',
      ]),
    );

    return postsWithCommentsCount.map((post) => exclude(post, ['userId']));
  }
}
