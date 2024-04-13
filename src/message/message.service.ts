import { Injectable } from '@nestjs/common';

import { ConversationService } from '#conversation/conversation.service';
import { ConversationNotFoundException } from '#conversation/exceptions/conversation.exceptions';
import { PrismaService } from '#prisma/prisma.service';
import { createObjectByKeys, exclude } from '#utils/helpers';
import { FullConversation, Message, ShortUserInfo } from '#utils/types';

import {
  HasNoAccessForEditMessageException,
  HasNoAccessForSendMessageException,
  MessageNotFoundException,
} from './exceptions/message.exceptions';
import {
  CreateMessageParams,
  CreateMessageReponse,
  DeleteLastMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
  EditMessageResponse,
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
    const conversation = await this.conversationService.getConversationById({
      conversationId,
    });

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

    const conversation = await this.conversationService.getConversationById({
      conversationId,
      withLastMessage: true,
    });
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

  async editMessage(
    params: EditMessageParams,
  ): Promise<EditMessageResponse | Message> {
    const { content, messageId, userId, conversationId } = params;

    const conversation = await this.conversationService.getConversationById({
      conversationId,
      withLastMessage: true,
    });

    if (!conversation) throw new ConversationNotFoundException();

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
      data: { content, updatedAt: new Date() },
      include: {
        author: { select: this.selectUserFields() },
      },
    });

    if (conversation.lastMessageId !== messageId) {
      return exclude(updatedMessage, ['authorId']);
    }

    const updatedConversation =
      await this.conversationService.setLastConversationMessage({
        conversationId: conversation.id,
        messageId: updatedMessage.id,
      });

    return {
      message: exclude(updatedMessage, ['authorId']),
      conversation: updatedConversation,
    };
  }

  async deleteMessage(
    params: DeleteMessageParams,
  ): Promise<DeleteLastMessageResponse> {
    const { conversationId, messageId, userId } = params;

    const conversation = await this.conversationService.getConversationById({
      conversationId,
      withLastMessage: true,
    });

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

    if (conversation.lastMessageId !== message.id) {
      const deletedMessage = await this.prismaService.message.delete({
        where: { id: messageId },
        include: {
          author: { select: this.selectUserFields() },
        },
      });

      const updatedConversation =
        await this.conversationService.getConversationById({
          conversationId,
          withLastMessage: true,
        });

      return {
        message: deletedMessage,
        conversation: exclude(updatedConversation, ['messages']),
      };
    }

    return this.deleteLastMessage(conversation, messageId);
  }

  async deleteLastMessage(
    conversation: FullConversation,
    messageId: number,
  ): Promise<DeleteLastMessageResponse> {
    const size = conversation.messages.length;

    if (size <= 1) {
      const deletedMessage = await this.prismaService.message.delete({
        where: { id: messageId },
        include: {
          author: { select: this.selectUserFields() },
        },
      });

      const updatedConversation =
        await this.conversationService.setLastConversationMessage({
          conversationId: conversation.id,
        });

      return {
        conversation: updatedConversation,
        message: exclude(deletedMessage, ['authorId']),
      };
    } else {
      const LAST_MESSAGE_INDEX = size - 2;

      const newLastMessage = conversation.messages[LAST_MESSAGE_INDEX];

      const deletedMessage = await this.prismaService.message.delete({
        where: { id: messageId },
        include: {
          author: { select: this.selectUserFields() },
        },
      });

      const updatedConversation =
        await this.conversationService.setLastConversationMessage({
          conversationId: conversation.id,
          messageId: newLastMessage.id,
        });

      return {
        conversation: updatedConversation,
        message: exclude(deletedMessage, ['authorId']),
      };
    }
  }
}
