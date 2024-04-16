import { PaginationParams } from '#utils/types';

export type FollowUserParams = {
  userId: number;
  followingUserId: number;
};

export type UnFollowUserParams = Partial<FollowUserParams>;

export type CheckFollowParams = Partial<FollowUserParams>;

export type CheckFollowsResponse = {
  followerId: number;
  followingId: number;
} | null;

export type GetFollowsParams = {
  paginationParams: PaginationParams;
  userId: number;
};

export type GetFollowersParams = GetFollowsParams;
