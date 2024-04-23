import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '#prisma/prisma.service';
import { UserService } from '#user/user.service';
import { getShortUserFields } from '#utils/helpers';
import { Follow, FollowingUser } from '#utils/types';

import { CouldNotFollowYorselfException } from './exceptions/follows.exceptions';
import {
  CheckFollowParams,
  CreateFollowParams,
  CreateMutualFollowParams,
  DeleteFollowsParams,
  DeleteMutualFollowsParams,
  FollowUserParams,
} from './types/follows.types';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
      include: { following: { select: getShortUserFields() } },
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingUserId,
        },
      },
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

    return { ...follow.following, mutualFollow: false };
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

  async unFollowUser(params: FollowUserParams): Promise<FollowingUser> {
    const { followingUserId } = params;

    await this.userService.findUserById(followingUserId);

    const isExistingMutualFollow = await this.checkMutualFollow(params);
    const isExistingFollow = await this.checkFollow(params);

    if (isExistingFollow && isExistingMutualFollow) {
      return this.deleteMutualFollow(params);
    } else {
      return this.deleteFollow(params);
    }
  }

  async followUser(params: FollowUserParams): Promise<FollowingUser> {
    const { userId, followingUserId } = params;

    await this.userService.findUserById(followingUserId);

    if (userId === followingUserId) throw new CouldNotFollowYorselfException();

    const isExistingMutualFollow = await this.checkMutualFollow(params);
    const isExistingFollow = await this.checkFollow(params);

    if (!isExistingMutualFollow && !isExistingFollow) {
      this.eventEmitter.emit('create_notification', {
        authorId: userId,
        recipientId: followingUserId,
        type: 'follow',
        typeEntityId: userId,
      });

      return this.createFollow(params);
    }

    if (isExistingMutualFollow && !isExistingFollow) {
      this.eventEmitter.emit('create_notification', {
        authorId: userId,
        recipientId: followingUserId,
        type: 'follow',
        typeEntityId: userId,
      });

      return this.createMutualFollow(params);
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
