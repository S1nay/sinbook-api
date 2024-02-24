import { Prisma } from '@prisma/client';

export type PostWithCountField = Prisma.PostGetPayload<{
  include: {
    user: true;
    _count: {
      select: Omit<Prisma.PostCountOutputTypeSelect, 'comments'>;
    };
  };
}>;

export type PostCountFields = {
  comments: number;
};
