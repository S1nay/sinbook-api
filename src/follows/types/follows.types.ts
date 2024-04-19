import { PaginationParams } from '#utils/types';

export type FollowUserParams = {
  userId: number;
  followingUserId: number;
};

export type CheckFollowParams = FollowUserParams;

export type CreateFollowParams = FollowUserParams;
export type CreateMutualFollowParams = FollowUserParams;

export type DeleteFollowsParams = FollowUserParams;
export type DeleteMutualFollowsParams = FollowUserParams;

export type GetFollowsParams = {
  paginationParams: PaginationParams;
  userId: number;
};

export type GetFollowersParams = GetFollowsParams;
