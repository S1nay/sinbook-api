export type SendUpdatedConversationParams = {
  conversationId: number;
  messageId?: number;
  recipientId: number;
  event: string;
};
