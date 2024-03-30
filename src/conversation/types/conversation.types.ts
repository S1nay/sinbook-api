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

export type ConversationUser = {
  id: string;
  name: string;
  secondName: string;
  avatarPath: string;
};
