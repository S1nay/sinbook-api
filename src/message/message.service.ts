import { Injectable } from '@nestjs/common';

import { ConversationService } from '#conversation/conversation.service';
import { ConversationNotFoundException } from '#conversation/exceptions/conversation.exceptions';
import { PrismaService } from '#prisma/prisma.service';
import { createObjectByKeys, exclude } from '#utils/helpers';
import { ConversationInfo, Message, ShortUserInfo } from '#utils/types';

import {
  HasNoAccessForEditMessageException,
  HasNoAccessForSendMessageException,
  MessageNotFoundException,
} from './exceptions/message.exceptions';
import {
  CreateMessageParams,
  CreateMessageReponse,
  DeleteMessageParams,
  EditMessageParams,
} from './types/message.types';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  private selectUserFields() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'secondName',
      'avatarPath',
    ]);
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const conversation =
      await this.conversationService.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

    const messages = await this.prismaService.message.findMany({
      where: { conversationId },
      include: {
        author: { select: this.selectUserFields() },
      },
    });

    return messages.map((message) => exclude(message, ['authorId']));
  }

  async createMessage(
    params: CreateMessageParams,
  ): Promise<CreateMessageReponse> {
    const { content, conversationId, userId } = params;

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
        author: { select: this.selectUserFields() },
      },
    });

    const updatedConversation =
      await this.conversationService.setLastConversationMessage({
        conversationId,
        messageId: message.id,
      });

    return {
      message: exclude(message, ['authorId']),
      conversation: updatedConversation,
    };
  }

  async getUnreadMessagesCount(conversationId: number): Promise<number> {
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

  async setMessagesIsReaded(conversationId: number): Promise<number> {
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

  async editMessage(params: EditMessageParams): Promise<Message> {
    const { content, messageId, userId } = params;

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
        author: { select: this.selectUserFields() },
      },
    });

    return exclude(updatedMessage, ['authorId']);
  }

  async deleteMessage(params: DeleteMessageParams): Promise<Message> {
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
        include: {
          author: { select: this.selectUserFields() },
        },
      });
    }

    return this.deleteLastMessage(conversation, messageId);
  }

  async deleteLastMessage(
    conversation: ConversationInfo,
    messageId: number,
  ): Promise<Message> {
    const size = conversation.messages.length;
    const LAST_MESSAGE_INDEX = size - 1;

    if (size <= 1) {
      await this.conversationService.setLastConversationMessage({
        conversationId: conversation.id,
      });

      const deletedMessage = await this.prismaService.message.delete({
        where: { id: messageId },
        include: {
          author: { select: this.selectUserFields() },
        },
      });

      return exclude(deletedMessage, ['authorId']);
    } else {
      const newLastMessage = conversation.messages[LAST_MESSAGE_INDEX];

      await this.conversationService.setLastConversationMessage({
        conversationId: conversation.id,
        messageId: newLastMessage.id,
      });

      const deletedMessage = await this.prismaService.message.delete({
        where: { id: messageId },
        include: {
          author: { select: this.selectUserFields() },
        },
      });

      return exclude(deletedMessage, ['authorId']);
    }
  }
}
