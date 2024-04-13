import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import {
  createObjectByKeys,
  exclude,
  transformFieldCount,
} from '#utils/helpers';
import {
  FollowersCountFields,
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

  private getFollowerUserFields() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'nickName',
      'secondName',
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

  async getFollowers(userId: number) {
    const userWithFollowers = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        followers: {
          select: {
            follower: {
              select: this.getFollowerUserFields(),
            },
          },
        },
      },
    });

    return userWithFollowers.followers.map((follower) => ({
      ...follower.follower,
    }));
  }

  async getFollows(userId: number) {
    const userWithFollows = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        follows: {
          select: {
            following: {
              select: this.getFollowerUserFields(),
            },
          },
        },
      },
    });

    return userWithFollows.follows.map((following) => ({
      ...following.following,
    }));
  }

  async followUser(userId: number, followingUserId: number) {
    return this.prismaService.follows.create({
      data: {
        follower: {
          connect: {
            id: userId,
          },
        },
        following: {
          connect: {
            id: followingUserId,
          },
        },
      },
    });
  }

  async unFollowUser(userId: number, followingUserId: number) {
    return this.prismaService.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingUserId,
        },
      },
    });
  }
}
