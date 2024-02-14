import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { SelectPostFields } from './types/post.type';
import { POST_NOT_FOUND } from './constants/post.constants';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  private selectPostFields(
    excludedFields?: (keyof SelectPostFields)[],
  ): SelectPostFields {
    const returnedFields: SelectPostFields = {
      id: true,
      title: true,
      user: {
        select: {
          id: true,
          avatarPath: true,
          isDeleted: true,
          name: true,
          secondName: true,
          middleName: true,
        },
      },
      views: true,
      comments: true,
      images: true,
      likes: true,
      createdAt: true,
      updatedAt: true,
    };

    if (excludedFields) {
      for (const field of excludedFields) {
        delete returnedFields[field];
      }
    }

    return returnedFields;
  }

  async createPost(createPostDto: CreatePostDto, userId: number) {
    return this.prismaService.post.create({
      data: {
        ...createPostDto,
        user: {
          connect: { id: userId },
        },
      },
      select: this.selectPostFields(),
    });
  }

  // findAll() {
  //   return `This action returns all post`;
  // }

  async findPostById(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      select: this.selectPostFields(),
    });

    if (!post) {
      throw new NotFoundException(POST_NOT_FOUND);
    }

    return post;
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto, userId: number) {
    await this.findPostById(id);

    return this.prismaService.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      select: this.selectPostFields(),
    });
  }

  async deletePost(id: number) {
    await this.findPostById(id);

    return `This action removes a #${id} post`;
  }
}
