import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import {
  exclude,
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
} from '#utils/helpers';
import {
  PaginationResponse,
  ShortUserInfo,
  User,
  UserWithCountFields,
  UserWithoutEmailWithFollowCount,
  UserWithPasswordHash,
} from '#utils/types';

import { UserNotFoundException } from './exceptions/user.exceptions';
import {
  CreateUserParams,
  EditUserParams,
  FindUsersParams,
} from './types/user.type';
import {
  getUserFilters,
  transformUser,
  transformUsersArray,
} from './utils/user.utils';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(params: CreateUserParams): Promise<User | null> {
    const { userData } = params;

    const user = await this.prismaService.user.create({
      data: userData,
    });

    return exclude(user, ['passwordHash']);
  }

  async findUserById(
    id: number,
    fromAuth: boolean = false,
  ): Promise<UserWithoutEmailWithFollowCount> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        _count: { select: { followers: true, follows: true, posts: true } },
      },
    });

    if (fromAuth && !user) return null;

    if (!user) throw new UserNotFoundException();

    return transformUser(user);
  }

  async findUserByEmail(email: string): Promise<UserWithPasswordHash> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findUserByNickName(nickName: string): Promise<UserWithPasswordHash> {
    const user = await this.prismaService.user.findFirst({
      where: { nickName: `@${nickName}` },
    });

    return user;
  }

  async editUser(params: EditUserParams): Promise<UserWithCountFields> {
    const { userData, userId } = params;

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: userData,
      include: {
        _count: { select: { followers: true, follows: true } },
      },
    });

    return transformUser(user);
  }

  async softDeleteUser(id: number): Promise<User> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return exclude(user, ['passwordHash']);
  }

  async findUsers(
    params: FindUsersParams,
  ): Promise<PaginationResponse<ShortUserInfo>> {
    const { skip, take } = getPaginationParams(params);

    const filters = getUserFilters(params);

    const users = await this.prismaService.user.findMany({
      skip,
      take,
      where: filters,
      select: {
        follows: { select: { mutualFollow: true } },
        ...getShortUserFields(),
      },
    });

    const totalUsers = await this.prismaService.user.count({ where: filters });

    const transformedUsers = transformUsersArray(users);

    return {
      results: transformedUsers,
      meta: getPaginationMeta(params, totalUsers),
    };
  }
}
