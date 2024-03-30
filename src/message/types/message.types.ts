import { Prisma } from '@prisma/client';

export type CreateMessageParams = {
  userId: number;
  content: string;
  conversationId: number;
};

export type EditMessageParams = {
  userId: number;
  messageId: number;
  content: string;
};

export type DeleteMessageParams = {
  conversationId: number;
  messageId: number;
  userId: number;
};

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    recipient: {
      select: {
        id: true;
        name: true;
        secondName: true;
        avatarPath: true;
      };
    };
    creator: {
      select: {
        id: true;
        name: true;
        secondName: true;
        avatarPath: true;
      };
    };
    messages: Omit<
      {
        select: {
          content: true;
          conversationId: true;
          createdAt: true;
          updatedAt: true;
          isReaded: true;
          id: true;
        };
        include: {
          author: {
            select: {
              id: true;
              name: true;
              secondName: true;
              avatarPath: true;
            };
          };
        };
      },
      'authorId'
    >;
  };
}>;
