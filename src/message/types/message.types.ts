import { Conversation, Message } from '#utils/types';

export type CreateMessageParams = {
  userId: number;
  content: string;
  conversationId: number;
};

export type EditMessageParams = {
  userId: number;
  messageId: number;
  content: string;
  conversationId: number;
};

export type DeleteMessageParams = {
  conversationId: number;
  messageId: number;
  userId: number;
};

export type CreateMessageReponse = {
  message: Message;
  conversation: Conversation;
};

export type DeleteLastMessageResponse = {
  message: Message;
  conversation: Conversation;
};

export type EditMessageResponse = {
  message: Message;
  conversation: Conversation;
};
