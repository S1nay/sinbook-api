import { Injectable } from '@nestjs/common';
import { Conversation as ConversationModel } from 'prisma/prisma-client';

import { PrismaService } from '#prisma/prisma.service';
import { UserService } from '#user/user.service';
import {
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
} from '#utils/helpers';
import { Conversation, PaginationResponse } from '#utils/types';

import {
  CannotCreateConversationWithYourselfException,
  ConversationIsAlreadyExistException,
  ConversationNotFoundException,
} from './exceptions/conversation.exceptions';
import {
  AccessParams,
  CheckConversationIsCreatedParams,
  CheckUnreadMessagesParams,
  CheckUnreadMessagesResponse,
  CreateConversationParams,
  GetConversationsParams,
  SetLastConversationMessageParams,
} from './types/conversation.types';
import {
  getConversationFilters,
  transformConversation,
} from './utils/conversation.utils';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async createConversation(
    params: CreateConversationParams,
  ): Promise<Conversation> {
    const { creatorId, message: content, recipientId } = params;

    const recipient = await this.userService.findUserById(recipientId);

    if (creatorId === recipient.id)
      throw new CannotCreateConversationWithYourselfException();

    const conversationIsAlreadyExist = await this.checkConversationIsCreated({
      userId: creatorId,
      recipientId: recipient.id,
    });

    if (conversationIsAlreadyExist)
      throw new ConversationIsAlreadyExistException();

    const newConversation = await this.prismaService.conversation.create({
      data: {
        creator: { connect: { id: creatorId } },
        recipient: { connect: { id: recipientId } },
      },
    });

    const firstMessage = await this.prismaService.message.create({
      data: {
        content,
        conversation: { connect: { id: newConversation.id } },
        author: { connect: { id: creatorId } },
      },
    });

    const newConversationWithFirstMessage =
      await this.setLastConversationMessage({
        conversationId: newConversation.id,
        messageId: firstMessage.id,
      });

    return newConversationWithFirstMessage;
  }

  async getConversationById(conversationId: number): Promise<Conversation> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        recipient: { select: getShortUserFields() },
        creator: { select: getShortUserFields() },
        messages: { include: { author: { select: getShortUserFields() } } },
      },
    });

    if (!conversation) throw new ConversationNotFoundException();

    return conversation;
  }

  async checkConversationIsCreated(
    params: CheckConversationIsCreatedParams,
  ): Promise<ConversationModel> {
    const { userId, recipientId } = params;
    return this.prismaService.conversation.findFirst({
      where: {
        OR: [
          {
            creator: { id: userId },
            recipient: { id: recipientId },
          },
          {
            creator: { id: recipientId },
            recipient: { id: userId },
          },
        ],
      },
    });
  }

  async getConversations(
    params: GetConversationsParams,
  ): Promise<PaginationResponse<Conversation>> {
    const { paginationParams } = params;

    const { take, skip } = getPaginationParams(paginationParams);

    const filters = getConversationFilters(params);

    const conversations = await this.prismaService.conversation.findMany({
      where: filters,
      take,
      skip,
      include: {
        creator: { select: getShortUserFields() },
        recipient: { select: getShortUserFields() },
        lastMessage: true,
        _count: {
          select: { messages: { where: { isReaded: false } } },
        },
      },
    });

    const conversationsCount = await this.prismaService.conversation.count({
      where: filters,
    });

    const transformedConversations = conversations.map(transformConversation);

    return {
      results: transformedConversations,
      meta: getPaginationMeta(paginationParams, conversationsCount),
    };
  }

  async hasAccess(params: AccessParams): Promise<boolean> {
    const { conversationId, userId } = params;

    const conversation = await this.getConversationById(conversationId);

    return (
      conversation?.creator?.id === userId ||
      conversation?.recipient?.id === userId
    );
  }

  async setLastConversationMessage(
    params: SetLastConversationMessageParams,
  ): Promise<Conversation> {
    const { conversationId, messageId } = params;

    const updateConversation = await this.prismaService.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: messageId
          ? { connect: { id: messageId } }
          : { disconnect: true },
      },
      include: {
        recipient: { select: getShortUserFields() },
        creator: { select: getShortUserFields() },
        lastMessage: true,
        _count: {
          select: { messages: { where: { isReaded: false } } },
        },
      },
    });

    return transformConversation(updateConversation);
  }

  async readUnreadMessages(conversationId: number): Promise<Conversation> {
    const updateConversation = await this.prismaService.conversation.update({
      where: { id: conversationId },
      data: {
        messages: {
          updateMany: {
            where: { isReaded: false },
            data: { isReaded: true },
          },
        },
      },
      include: {
        recipient: { select: getShortUserFields() },
        creator: { select: getShortUserFields() },
        lastMessage: true,
        _count: {
          select: { messages: { where: { isReaded: false } } },
        },
      },
    });

    return transformConversation(updateConversation);
  }

  async checkUnreadMessages(
    params: CheckUnreadMessagesParams,
  ): Promise<CheckUnreadMessagesResponse> {
    const { conversationId, userId } = params;

    const conversation = await this.getConversationById(conversationId);

    const isHaveUnreadedMessages = !!conversation.messages.filter(
      (message) => !message.isReaded,
    ).length;

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    const isLastMessageNotFromConnectedUser = lastMessage.author.id !== userId;

    return { isHaveUnreadedMessages, isLastMessageNotFromConnectedUser };
  }
}
