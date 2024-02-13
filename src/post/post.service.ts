import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { SelectPostFields } from './types/post.type';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  selectPostFields(
    excludedFields?: (keyof SelectPostFields)[],
  ): SelectPostFields {
    const returnedFields: SelectPostFields = {
      id: true,
      title: true,
      user: true,
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

  async create(createPostDto: CreatePostDto, userId: number) {
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

  // findOne(id: number) {
  //   return `This action returns a #${id} post`;
  // }

  // update(id: number, updatePostDto: UpdatePostDto) {
  //   return `This action updates a #${id} post`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} post`;
  // }
}
