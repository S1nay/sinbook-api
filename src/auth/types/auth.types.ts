import { User } from '@prisma/client';

import { TokenInfo, UserWithPasswordHash } from '#utils/types';

export type LoginParams = {
  email: string;
  password: string;
};

export type RegisterParams = Omit<
  User,
  'id' | 'isDeleted' | 'createdAt' | 'updatedAt'
> & { password: string };

export type GenerateTokensParam = UserWithPasswordHash | User | TokenInfo;
