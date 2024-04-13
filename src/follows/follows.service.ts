import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import { createObjectByKeys } from '#utils/helpers';
import { ShortUserInfo } from '#utils/types';

import {
  FollowIsAlreadyExistException,
  FollowIsNotExistException,
} from './exceptions/follows.exceptions';
import {
  CheckFollowParams,
  CheckFollowsResponse,
  FollowUserParams,
  UnFollowUserParams,
} from './types/follows.types';

@Injectable()
export class FollowsService {
  constructor(private readonly prismaService: PrismaService) {}

  private getFollowerUserFields() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'nickName',
      'secondName',
      'avatarPath',
    ]);
  }

  async getFollowers(userId: number): Promise<ShortUserInfo[]> {
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

  async getFollows(userId: number): Promise<ShortUserInfo[]> {
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

  async followUser({
    userId,
    followingUserId,
  }: FollowUserParams): Promise<void> {
    const follow = await this.checkFollow({ userId, followingUserId });

    if (follow) throw new FollowIsAlreadyExistException();

    await this.prismaService.follows.create({
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

  async unFollowUser({
    userId,
    followingUserId,
  }: UnFollowUserParams): Promise<void> {
    const follow = await this.checkFollow({ userId, followingUserId });

    if (!follow) throw new FollowIsNotExistException();

    await this.prismaService.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingUserId,
        },
      },
    });
  }

  async checkFollow({
    userId,
    followingUserId,
  }: CheckFollowParams): Promise<CheckFollowsResponse> {
    const follow = await this.prismaService.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingUserId,
        },
      },
    });

    return follow;
  }
}
