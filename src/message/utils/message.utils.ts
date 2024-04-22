import { GetConversationMessagesParams } from '../types/message.types';

export function getMessageFilters(params: GetConversationMessagesParams) {
  const { conversationId, paginationParams } = params;

  const searchFilters = {
    ...(paginationParams.search && {
      content: { contains: paginationParams.search },
    }),
  };

  return {
    AND: [searchFilters, { conversationId }],
  };
}
