import { Prisma } from '@prisma/client';

export type UserWithCountField = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: Omit<Prisma.UserCountOutputTypeSelect, 'posts' | 'comments'>;
    };
  };
}>;

export type CountFields = {
  followersCount: number;
  followersOfCount: number;
};
