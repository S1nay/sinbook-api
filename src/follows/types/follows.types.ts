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
