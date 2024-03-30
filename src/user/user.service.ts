import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import { exclude } from '#utils/helpers';

import { CreateUserParams, EditUserParams } from './types/user.type';
import {
  UserWithFollowsCount,
  UserWithoutEmailWithFollowCount,
  User,
  SelectUserFollowsCount,
  FollowersCountFields,
  UserWithPasswordHash,
} from '#utils/types';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private transformUserCount<T>(user: SelectUserFollowsCount) {
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

  async findMyProfile(userId: number): Promise<UserWithFollowsCount> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { followers: true, following: true } },
      },
    });

    const userWithFollowsCount =
      this.transformUserCount<FollowersCountFields>(user);

    return exclude(userWithFollowsCount, ['passwordHash']);
  }

  async createUser(params: CreateUserParams): Promise<User> {
    const { userData } = params;

    const user = await this.prismaService.user.create({
      data: userData,
    });

    return exclude(user, ['passwordHash']);
  }

  async findUserById(id: number): Promise<UserWithoutEmailWithFollowCount> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        _count: { select: { followers: true, following: true } },
      },
    });

    return exclude(this.transformUserCount<FollowersCountFields>(user), [
      'passwordHash',
      'email',
    ]);
  }

  async findUserByEmail(email: string): Promise<UserWithPasswordHash> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    return user;
  }

  async editUser(params: EditUserParams): Promise<UserWithFollowsCount> {
    const { userData, userId } = params;

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...userData,
        birthDate: new Date(userData.birthDate),
      },
      include: {
        _count: { select: { followers: true, following: true } },
      },
    });

    const userWithFollowsCount =
      this.transformUserCount<FollowersCountFields>(user);

    return exclude(userWithFollowsCount, ['passwordHash']);
  }

  async softDeleteUser(id: number): Promise<User> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return exclude(user, ['passwordHash']);
  }
}
