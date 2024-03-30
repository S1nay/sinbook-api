import { TokenInfo, UserWithPasswordHash } from '#utils/types';
import { User } from '@prisma/client';

export type LoginParams = {
  email: string;
  password: string;
};

export type RegisterParams = Omit<
  User,
  'id' | 'isDeleted' | 'createdAt' | 'updatedAt'
> & { password: string };

export type ValidateUserParams = {
  authParams: LoginParams | RegisterParams;
  isRegister: boolean;
};

export type GenerateTokensParam = UserWithPasswordHash | User | TokenInfo;
