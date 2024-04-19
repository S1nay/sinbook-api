import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import {
  exclude,
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
  transformFieldCount,
} from '#utils/helpers';
import {
  FollowersCountFields,
  PaginationParams,
  PaginationResponse,
  SelectUserFollowsCount,
  ShortUserInfo,
  User,
  UserWithFollowsCount,
  UserWithoutEmailWithFollowCount,
  UserWithPasswordHash,
} from '#utils/types';

import { UserNotFoundException } from './exceptions/user.exceptions';
import { CreateUserParams, EditUserParams } from './types/user.type';
import { transformUser } from './utils/user.utils';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findMyProfile(userId: number): Promise<UserWithFollowsCount> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { followers: true, follows: true } },
      },
    });

    return transformUser(user);
  }

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
        _count: { select: { followers: true, follows: true } },
      },
    });

    if (fromAuth && !user) return null;

    if (!user) throw new UserNotFoundException();

    const userWithFollowsCount = transformFieldCount<
      SelectUserFollowsCount,
      FollowersCountFields
    >(user, ['followersCount', 'followsCount']);

    return exclude(userWithFollowsCount, ['passwordHash', 'email']);
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
    params: PaginationParams,
  ): Promise<PaginationResponse<ShortUserInfo>> {
    const { skip, take } = getPaginationParams(params);

    const searchFilter = {
      ...(params?.search && {
        name: { contains: params?.search || '' },
        secondName: { contains: params?.search },
        middleName: { contains: params?.search },
        nickName: { contains: params?.search },
      }),
    };

    const users = await this.prismaService.user.findMany({
      select: getShortUserFields(),
      skip,
      take,
      where: searchFilter,
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
    });

    const totalUsers = await this.prismaService.user.count({
      where: searchFilter,
    });

    return {
      results: users,
      meta: getPaginationMeta(params, totalUsers),
    };
  }
}
