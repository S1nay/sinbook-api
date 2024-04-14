import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import {
  createObjectByKeys,
  exclude,
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

import { CreateUserParams, EditUserParams } from './types/user.type';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private getShortUserInfo() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'nickName',
      'secondName',
      'avatarPath',
    ]);
  }

  async findMyProfile(userId: number): Promise<UserWithFollowsCount> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { followers: true, follows: true } },
      },
    });

    const userWithFollowsCount = transformFieldCount<
      SelectUserFollowsCount,
      FollowersCountFields
    >(user, ['followersCount', 'followsCount']);

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
        _count: { select: { followers: true, follows: true } },
      },
    });

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

    const userWithFollowsCount = transformFieldCount<
      SelectUserFollowsCount,
      FollowersCountFields
    >(user, ['followersCount', 'followsCount']);

    return exclude(userWithFollowsCount, ['passwordHash']);
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
    const page = params?.page || 1;
    const limit =
      params?.perPage || params?.perPage === 0 ? params?.perPage : 10;

    const take = limit === 0 ? undefined : limit;
    const skip = (page - 1) * limit ?? 0;

    const searchParams = {
      where: {
        ...(params?.search && {
          OR: [
            { name: { contains: params?.search || '' } },
            { secondName: { contains: params?.search } },
            { middleName: { contains: params?.search } },
            { nickName: { contains: params?.search } },
          ],
        }),
      },
    };

    const [users, totalCount] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        select: this.getShortUserInfo(),
        skip,
        take,
        ...searchParams,
        orderBy: {
          followers: {
            _count: 'desc',
          },
        },
      }),
      this.prismaService.user.count({
        ...searchParams,
      }),
    ]);

    return {
      results: users,
      meta: {
        page: params?.page,
        perPage: params?.perPage,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / params?.perPage),
      },
    };
  }
}
