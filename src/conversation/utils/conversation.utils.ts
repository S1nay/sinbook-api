import { exclude, transformFieldCount } from '#utils/helpers';
import {
    ConversationUnreadMessagesCount,
    SelectConversationWithFields,
} from '#utils/types';

export function transformConversation(
  conversation: SelectConversationWithFields,
) {
  const transfornedConversation = transformFieldCount<
    SelectConversationWithFields,
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
