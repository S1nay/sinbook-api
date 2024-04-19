import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import { UserService } from '#user/user.service';
import {
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
} from '#utils/helpers';
import { Follow, FollowingUser, PaginationResponse } from '#utils/types';

import { CouldNotFollowYorselfException } from './exceptions/follows.exceptions';
import {
  CheckFollowParams,
  CreateFollowParams,
  CreateMutualFollowParams,
  DeleteFollowsParams,
  DeleteMutualFollowsParams,
  FollowUserParams,
  GetFollowersParams,
  GetFollowsParams,
} from './types/follows.types';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getFollowers(
    params: GetFollowersParams,
  ): Promise<PaginationResponse<FollowingUser>> {
    const { paginationParams, userId } = params;

    await this.userService.findUserById(userId);

    const { skip, take } = getPaginationParams(paginationParams);

    const searchFilter = {
      ...(paginationParams?.search && {
        name: { contains: paginationParams?.search || '' },
        secondName: { contains: paginationParams?.search },
        middleName: { contains: paginationParams?.search },
        nickName: { contains: paginationParams?.search },
      }),
    };

    const followers = await this.prismaService.follows.findMany({
      where: {
        AND: [{ followingId: userId }, { following: searchFilter }],
      },
      take,
      skip,
      include: {
        follower: { select: getShortUserFields() },
      },
    });

    const followersCount = await this.prismaService.follows.count({
      where: {
        AND: [{ followingId: userId }, { following: searchFilter }],
      },
    });

    return {
      results: followers.map((follower) => {
        return {
          ...follower.follower,
          mutualFollow: follower.mutualFollow,
        };
      }),
      meta: getPaginationMeta(paginationParams, followersCount),
    };
  }

  async getFollows(
    params: GetFollowsParams,
  ): Promise<PaginationResponse<FollowingUser>> {
    const { paginationParams, userId } = params;

    await this.userService.findUserById(userId);

    const { skip, take } = getPaginationParams(paginationParams);

    const searchFilter = {
      ...(paginationParams?.search && {
        name: { contains: paginationParams?.search || '' },
        secondName: { contains: paginationParams?.search },
        middleName: { contains: paginationParams?.search },
        nickName: { contains: paginationParams?.search },
      }),
    };

    const follows = await this.prismaService.follows.findMany({
      where: {
        AND: [{ followerId: userId }, { following: searchFilter }],
      },
      skip,
      take,
      include: {
        following: { select: getShortUserFields() },
      },
    });

    const followsCount = await this.prismaService.follows.count({
      where: {
        AND: [{ followerId: userId }, { follower: searchFilter }],
      },
    });

    return {
      results: follows.map((following) => ({
        ...following.following,
        mutualFollow: following.mutualFollow,
      })),
      meta: getPaginationMeta(paginationParams, followsCount),
    };
  }

  async createFollow(params: CreateFollowParams): Promise<FollowingUser> {
    const { followingUserId, userId } = params;

    const follow = await this.prismaService.follows.create({
      data: {
        follower: { connect: { id: userId } },
        following: { connect: { id: followingUserId } },
        mutualFollow: false,
      },
      include: { following: { select: getShortUserFields() } },
    });

    return { ...follow.following, mutualFollow: follow.mutualFollow };
  }

  async createMutualFollow(
    params: CreateMutualFollowParams,
  ): Promise<FollowingUser> {
    const { userId, followingUserId } = params;
    const follow = await this.prismaService.follows.create({
      data: {
        follower: { connect: { id: userId } },
        following: { connect: { id: followingUserId } },
        mutualFollow: true,
      },
      include: { following: { select: getShortUserFields() } },
    });

    await this.prismaService.follows.update({
      where: {
        followerId_followingId: {
          followerId: followingUserId,
          followingId: userId,
        },
      },
      data: {
        mutualFollow: true,
      },
    });

    return { ...follow.following, mutualFollow: follow.mutualFollow };
  }
  async deleteMutualFollow(
    params: DeleteMutualFollowsParams,
  ): Promise<FollowingUser> {
    const { followingUserId, userId } = params;

    const follow = await this.prismaService.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingUserId,
        },
      },
      include: { following: { select: getShortUserFields() } },
    });

    await this.prismaService.follows.update({
      where: {
        followerId_followingId: {
          followerId: followingUserId,
          followingId: userId,
        },
      },
      data: {
        mutualFollow: false,
      },
    });

    return { ...follow.following, mutualFollow: follow.mutualFollow };
  }
  async deleteFollow(params: DeleteFollowsParams): Promise<FollowingUser> {
    const { followingUserId, userId } = params;

    const follow = await this.prismaService.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingUserId,
        },
      },
      include: { following: { select: getShortUserFields() } },
    });

    return { ...follow.following, mutualFollow: follow.mutualFollow };
  }

  async followUser(params: FollowUserParams) {
    const { userId, followingUserId } = params;

    await this.userService.findUserById(followingUserId);

    if (userId === followingUserId) throw new CouldNotFollowYorselfException();

    const isExistingMutualFollow = await this.checkMutualFollow(params);
    const isExistingFollow = await this.checkFollow(params);

    if (!isExistingMutualFollow && !isExistingFollow) {
      return this.createFollow(params);
    }

    if (isExistingMutualFollow && !isExistingFollow) {
      return this.createMutualFollow(params);
    }

    if (isExistingFollow && isExistingMutualFollow) {
      await this.deleteMutualFollow(params);
    } else {
      await this.deleteFollow(params);
    }
  }

  async checkMutualFollow(params: CheckFollowParams): Promise<Follow> {
    const { followingUserId, userId } = params;

    return this.prismaService.follows.findFirst({
      where: { followerId: followingUserId, followingId: userId },
    });
  }

  async checkFollow(params: CheckFollowParams): Promise<Follow> {
    const { followingUserId, userId } = params;

    return this.prismaService.follows.findFirst({
      where: { followerId: userId, followingId: followingUserId },
    });
  }
}
