import { PaginationParams } from '#utils/types';

export type AccessParams = {
  conversationId: number;
  userId: number;
};

export type CheckConversationIsCreatedParams = {
  userId: number;
  recipientId: number;
};

export type SetLastConversationMessageParams = {
  conversationId: number;
  messageId?: number;
};

export type CreateConversationParams = {
  message: string;
  creatorId: number;
  recipientId: number;
};

export type GetConversationsParams = {
  userId: number;
  paginationParams: PaginationParams;
};

export type CheckUnreadMessagesParams = {
  conversationId: number;
  userId: number;
};

export type CheckUnreadMessagesResponse = {
  isHaveUnreadedMessages: boolean;
  isLastMessageNotFromConnectedUser: boolean;
};
