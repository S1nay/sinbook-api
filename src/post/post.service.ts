import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';

import { PrismaService } from '#prisma/prisma.service';
import { UserService } from '#user/user.service';

import { POST_NOT_FOUND } from './constants/post.constants';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCountFields, PostWithCountField } from './types/post.types';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  private transformPostCount<T>(post: PostWithCountField) {
    const postCount = post._count;

    const modifiedValues = Object.keys(postCount).reduce((acc, key) => {
      const modifiedKey = `${key}Count`;
      acc[modifiedKey] = postCount[key];
      return acc;
    }, {}) as T;

    delete post._count;

    return {
      ...post,
      ...modifiedValues,
    };
  }

  async createPost(createPostDto: CreatePostDto, userId: number) {
    const post = await this.prismaService.post.create({
      data: {
        ...createPostDto,
        user: {
          connect: { id: userId },
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

    return post;
  }

  async findPostById(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            secondName: true,
            nickName: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(POST_NOT_FOUND);
    }

    return this.transformPostCount<PostCountFields>(post);
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto, userId: number) {
    await this.findPostById(id);

    const post = await this.prismaService.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
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

    return this.transformPostCount<PostCountFields>(post);
  }

  async deletePost(id: number): Promise<void> {
    await this.findPostById(id);

    await this.prismaService.post.delete({
      where: { id },
    });
  }

  async findUserPosts(userId: number): Promise<Post[]> {
    await this.userService.findUserById(userId);

    const posts = await this.prismaService.post.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
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

    return posts.map((post) => this.transformPostCount<PostCountFields>(post));
  }
}
