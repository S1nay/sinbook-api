export type CheckConversationIsExistParams = {
  recipientId: number;
  senderId: number;
};

export type SetConversationLastMessageParams = {
  conversationId: number;
  messageId?: number;
};

export type CreateConversationParams = {
  senderId: number;
  recipientId: number;
};

export type UpdateMessageCountParams = {
  conversationId: number;
  isDelete?: boolean;
  isClear?: boolean;
};
