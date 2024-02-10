import { User } from '@prisma/client';

export type UserResponse = Omit<
  User,
  'passwordHash' | 'createdAt' | 'updatedAt'
>;
