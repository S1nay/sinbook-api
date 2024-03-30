import { Injectable } from '@nestjs/common';

import { ConversationService } from '#conversation/conversation.service';
import { PrismaService } from '#prisma/prisma.service';
import { ConversationNotFoundException } from '#conversation/exceptions/conversation.exceptions';
import {
  CreateMessageParams,
  DeleteMessageParams,
  EditMessageParams,
} from './types/message.types';
import {
  HasNoAccessForEditMessageException,
  HasNoAccessForSendMessageException,
  MessageNotFoundException,
} from './exceptions/message.exceptions';

import { createObjectByKeys } from '#utils/helpers';
import { ConversationUser } from '#conversation/types/conversation.types';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  async getConversationMessages(conversationId: number) {
    const selectUserFields = createObjectByKeys<ConversationUser>([
      'id',
      'name',
      'secondName',
      'avatarPath',
    ]);

    const conversation =
      await this.conversationService.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();
  }

  async createMessage(params: CreateMessageParams) {
    const { content, conversationId, userId } = params;

    const selectUserFields = createObjectByKeys<ConversationUser>([
      'id',
      'name',
      'secondName',
      'avatarPath',
    ]);

    const conversation =
      await this.conversationService.getConversationById(conversationId);
    if (!conversation) throw new ConversationNotFoundException();

    const { creator, recipient } = conversation;

    if (creator.id !== userId && recipient.id !== userId)
      throw new HasNoAccessForSendMessageException();

    const message = await this.prismaService.message.create({
      data: {
        content,
        conversation: { connect: { id: conversationId } },
        author: { connect: { id: userId } },
      },
      include: {
        author: { select: selectUserFields },
      },
    });

    const updatedConversation =
      await this.conversationService.setLastConversationMessage({
        conversationId,
        messageId: message.id,
      });

    return { message, conversation: updatedConversation };
  }

  async getUnreadMessagesCount(conversationId: number) {
    const conversation =
      await this.conversationService.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

    const unreadMessagesCount = await this.prismaService.message.count({
      where: {
        AND: [{ isReaded: false }, { conversationId }],
      },
    });

    return unreadMessagesCount;
  }

  async setMessagesIsReaded(conversationId: number) {
    const conversation =
      await this.conversationService.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

    await this.prismaService.message.updateMany({
      where: {
        AND: [{ conversationId }, { isReaded: false }],
      },
      data: { isReaded: true },
    });

    return this.getUnreadMessagesCount(conversationId);
  }

  async editMessage(params: EditMessageParams) {
    const { content, messageId, userId } = params;

    const selectUserFields = createObjectByKeys<ConversationUser>([
      'id',
      'name',
      'secondName',
      'avatarPath',
    ]);

    const message = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
        authorId: userId,
      },
    });

    if (!message) throw new MessageNotFoundException();

    if (message.authorId !== userId)
      throw new HasNoAccessForEditMessageException();

    const updatedMessage = await this.prismaService.message.update({
      where: { id: messageId },
      data: { content },
      include: {
        author: { select: selectUserFields },
      },
    });

    return updatedMessage;
  }

  async deleteMessage(params: DeleteMessageParams) {
    const { conversationId, messageId, userId } = params;

    const conversation =
      await this.conversationService.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

    const message = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
        conversationId,
        authorId: userId,
      },
    });

    if (!message) throw new MessageNotFoundException();

    if (message.authorId !== userId)
      throw new HasNoAccessForEditMessageException();

    if (conversation.lastMessagId !== message.id) {
      return this.prismaService.message.delete({
        where: { id: messageId },
      });
    }

    return this.deleteLastMessage(conversation, messageId);
  }

  async deleteLastMessage(conversation: any, messageId: number) {
    const size = conversation.messages.length;
    const LAST_MESSAGE_INDEX = size - 1;

    if (size <= 1) {
      await this.conversationService.setLastConversationMessage({
        conversationId: conversation.id,
      });

      return this.prismaService.message.delete({ where: { id: messageId } });
    } else {
      const newLastMessage = conversation.messages[LAST_MESSAGE_INDEX];

      await this.conversationService.setLastConversationMessage({
        conversationId: conversation.id,
        messageId: newLastMessage.id,
      });

      return this.prismaService.message.delete({ where: { id: messageId } });
    }
  }
}
