import { exclude, transformFieldCount } from '#utils/helpers';
import {
  ConversationUnreadMessagesCount,
  SelectConversation,
} from '#utils/types';

import { GetConversationsParams } from '../types/conversation.types';

export function transformConversation(conversation: SelectConversation) {
  const transfornedConversation = transformFieldCount<
    SelectConversation,
    ConversationUnreadMessagesCount
  >(conversation, ['unreadMessagesCount']);

  return {
    ...exclude(transfornedConversation, [
      'creatorId',
      'recipientId',
      'lastMessageId',
    ]),
  };
}

export function getConversationFilters(params: GetConversationsParams) {
  const { paginationParams, userId } = params;

  const searchFilter = {
    OR: [
      { name: { contains: paginationParams.search } },
      { secondName: { contains: paginationParams.search } },
      { middleName: { contains: paginationParams.search } },
      { nickName: { contains: paginationParams.search } },
    ],
  };

  const filters = {
    AND: [
      { OR: [{ creatorId: userId }, { recipientId: userId }] },
      { OR: [{ creator: searchFilter }, { recipient: searchFilter }] },
    ],
  };

  return filters;
}
