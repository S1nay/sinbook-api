import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { UserService } from '#user/user.service';
import {
  createObjectByKeys,
  getPaginationMeta,
  getPaginationParams,
} from '#utils/helpers';
import { PaginationResponse, ShortUserInfo } from '#utils/types';

import {
  FollowIsAlreadyExistException,
  FollowIsNotExistException,
} from './exceptions/follows.exceptions';
import {
  CheckFollowParams,
  CheckFollowsResponse,
  FollowUserParams,
  GetFollowersParams,
  GetFollowsParams,
  UnFollowUserParams,
} from './types/follows.types';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  private getFollowerUserFields() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'nickName',
      'secondName',
      'avatarPath',
    ]);
  }

  async getFollowers(
    params: GetFollowersParams,
  ): Promise<PaginationResponse<ShortUserInfo>> {
    const { paginationParams, userId } = params;

    const user = this.userService.findUserById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const { skip, take } = getPaginationParams(paginationParams);

    const searchFilter = {
      ...(paginationParams?.search && {
        name: { contains: paginationParams?.search || '' },
        secondName: { contains: paginationParams?.search },
        middleName: { contains: paginationParams?.search },
        nickName: { contains: paginationParams?.search },
      }),
    };

    const userWithFollowers = await this.prismaService.follows.findMany({
      where: { AND: [{ followerId: userId }, { follower: searchFilter }] },
      take,
      skip,
      include: {
        follower: { select: this.getFollowerUserFields() },
      },
    });

    const userFollowersCount = await this.prismaService.follows.count({
      where: { followerId: userId },
    });

    return {
      results: userWithFollowers.map((follower) => ({
        ...follower.follower,
      })),
      meta: getPaginationMeta(paginationParams, userFollowersCount),
    };
  }

  async getFollows(
    params: GetFollowsParams,
  ): Promise<PaginationResponse<ShortUserInfo>> {
    const { paginationParams, userId } = params;

    const user = this.userService.findUserById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    const { skip, take } = getPaginationParams(paginationParams);

    const searchFilter = {
      ...(paginationParams?.search && {
        name: { contains: paginationParams?.search || '' },
        secondName: { contains: paginationParams?.search },
        middleName: { contains: paginationParams?.search },
        nickName: { contains: paginationParams?.search },
      }),
    };

    const userWithFollows = await this.prismaService.follows.findMany({
      where: { AND: [{ followingId: userId }, { following: searchFilter }] },
      skip,
      take,
      include: {
        following: { select: this.getFollowerUserFields() },
      },
    });

    const userFollowsCount = await this.prismaService.follows.count({
      where: { followingId: userId },
    });

    return {
      results: userWithFollows.map((following) => ({
        ...following.following,
      })),
      meta: getPaginationMeta(paginationParams, userFollowsCount),
    };
  }

  async followUser({
    userId,
    followingUserId,
  }: FollowUserParams): Promise<void> {
    const follow = await this.checkFollow({ userId, followingUserId });

    if (follow) throw new FollowIsAlreadyExistException();

    await this.prismaService.follows.create({
      data: {
        follower: { connect: { id: userId } },
        following: { connect: { id: followingUserId } },
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
