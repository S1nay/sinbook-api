import { exclude, transformFieldCount } from '#utils/helpers';
import {
    ConversationUnreadMessagesCount,
    SelectConversation,
} from '#utils/types';

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
