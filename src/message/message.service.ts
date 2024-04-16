import { Injectable } from '@nestjs/common';

import { ConversationService } from '#conversation/conversation.service';
import { ConversationNotFoundException } from '#conversation/exceptions/conversation.exceptions';
import { PrismaService } from '#prisma/prisma.service';
import {
  createObjectByKeys,
  exclude,
  getPaginationMeta,
  getPaginationParams,
} from '#utils/helpers';
import { Message, PaginationResponse, ShortUserInfo } from '#utils/types';

import {
  HasNoAccessForEditMessageException,
  HasNoAccessForSendMessageException,
  MessageNotFoundException,
} from './exceptions/message.exceptions';
import {
  CreateMessageParams,
  CreateMessageReponse,
  DeleteLastMessageParams,
  DeleteLastMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
  EditMessageResponse,
  GetConversationMessages,
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

  async getConversationMessages(
    params: GetConversationMessages,
  ): Promise<PaginationResponse<Message>> {
    const { conversationId, paginationParams } = params;

    const { skip, take } = getPaginationParams(paginationParams);

    const searchFilter = {
      ...(paginationParams?.search && {
        content: { contains: paginationParams?.search || '' },
      }),
    };

    const conversation =
      await this.conversationService.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

    const messages = await this.prismaService.message.findMany({
      where: { AND: [{ conversationId: conversationId }, searchFilter] },
      include: {
        author: { select: this.selectUserFields() },
      },
      skip,
      take,
    });

    const messagesCount = await this.prismaService.message.count({
      where: { AND: [{ conversationId: conversationId }, searchFilter] },
    });

    return {
      results: messages.map((message) => exclude(message, ['authorId'])),
      meta: getPaginationMeta(paginationParams, messagesCount),
    };
  }

  async createMessage(
    params: CreateMessageParams,
  ): Promise<CreateMessageReponse> {
    const { content, conversationId, userId, isAllInChatRoom } = params;

    const conversation =
      await this.conversationService.getConversationById(conversationId);
    if (!conversation) throw new ConversationNotFoundException();

    const { creator, recipient } = conversation;

    if (creator.id !== userId && recipient.id !== userId)
      throw new HasNoAccessForSendMessageException();

    const message = await this.prismaService.message.create({
      data: {
        content,
        isReaded: isAllInChatRoom,
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

    const conversation =
      await this.conversationService.getConversationById(conversationId);

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

    if (conversation.lastMessage.id !== messageId) {
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

    if (conversation.lastMessage.id !== message.id) {
      const deletedMessage = await this.prismaService.message.delete({
        where: { id: messageId },
        include: {
          author: { select: this.selectUserFields() },
        },
      });

      const updatedConversation =
        await this.conversationService.getConversationById(conversationId);

      return {
        message: deletedMessage,
        conversation: exclude(updatedConversation, ['messages']),
      };
    }

    return this.deleteLastMessage({ conversation, messageId });
  }

  async deleteLastMessage(
    params: DeleteLastMessageParams,
  ): Promise<DeleteLastMessageResponse> {
    const { conversation, messageId } = params;

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
