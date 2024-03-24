export type CheckConversationIsExistParams = {
  recipientId: number;
  senderId: number;
};

export type SetConversationLastMessageParams = {
  conversationId: number;
  messageId: number;
};
