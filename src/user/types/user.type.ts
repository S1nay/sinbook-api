import { User } from '@prisma/client';

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
