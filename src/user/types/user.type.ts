import { User } from '@prisma/client';

import { PaginationParams } from '#utils/types';

type CreateUserData = Omit<
  User,
  'id' | 'isDeleted' | 'createdAt' | 'updatedAt'
>;

type UpdateUserData = Omit<
  User,
  'id' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'passwordHash'
>;

export type EditUserParams = {
  userId: number;
  userData: UpdateUserData;
};

export type CreateUserParams = {
  userData: CreateUserData;
};

export type FindUsersParams = PaginationParams & {
  follows?: boolean;
  followers?: boolean;
  userId?: number;
};
