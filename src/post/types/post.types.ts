import { Prisma } from '@prisma/client';

export type PostWithCountField = Prisma.PostGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        secondName: true;
        middleName: true;
      };
    };
    _count: {
      select: Omit<Prisma.PostCountOutputTypeSelect, 'comments'>;
    };
  };
}>;

export type PostCountFields = {
  comments: number;
};
