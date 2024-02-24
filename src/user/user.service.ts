import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserResponse,
  DeleteUserResponse,
  FindEmalUserResponse,
  FindMeResponse,
  FindUniqueUserResponse,
  UpdateUserResponse,
} from './responses/user.responses';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user-exceptions';
import { exclude } from 'src/utils/excludeFields';
import { CountFields, UserWithCountField } from './types/user.type';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private transformUserCount<T>(user: UserWithCountField) {
    const userCount = user._count;

    const modifiedValues = Object.keys(userCount).reduce((acc, key) => {
      const modifiedKey = `${key}Count`;
      acc[modifiedKey] = userCount[key];
      return acc;
    }, {}) as T;

    delete user._count;

    return {
      ...user,
      ...modifiedValues,
    };
  }

  async findMyProfile(userId: number): Promise<FindMeResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { followers: true, followersOf: true } },
      },
    });

    return exclude(this.transformUserCount<CountFields>(user), [
      'passwordHash',
    ]);
  }

  async createUser(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const user = await this.prismaService.user.create({
      data: createUserDto,
    });

    return exclude(user, ['passwordHash']);
  }

  async findUserById(id: number): Promise<FindUniqueUserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        _count: { select: { followers: true, followersOf: true } },
      },
    });

    if (!user) throw new UserNotFoundException();

    return exclude(this.transformUserCount<CountFields>(user), [
      'passwordHash',
      'email',
    ]);
  }

  async findUserByEmail(email: string): Promise<FindEmalUserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        _count: { select: { followers: true, followersOf: true } },
      },
    });

    return exclude(this.transformUserCount<CountFields>(user), [
      'passwordHash',
    ]);
  }

  async softDeleteUser(id: number): Promise<DeleteUserResponse> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    return exclude(user, ['passwordHash']);
  }
}
