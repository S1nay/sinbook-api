import { Injectable } from '@nestjs/common';
import { Conversation as ConversationModel } from 'prisma/prisma-client';

import { PrismaService } from '#prisma/prisma.service';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { UserService } from '#user/user.service';
import {
  createObjectByKeys,
  exclude,
  getPaginationMeta,
  getPaginationParams,
  transformFieldCount,
} from '#utils/helpers';
import {
  Conversation,
  ConversationUnreadMessagesCount,
  PaginationResponse,
  SelectConversationWithFields,
  ShortUserInfo,
} from '#utils/types';

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

@Injectable()
export class ConversationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  private selectUserFields() {
    return createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'nickName',
      'secondName',
      'avatarPath',
    ]);
  }

  private transformConversation(conversation: SelectConversationWithFields) {
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

  async createConversation(
    params: CreateConversationParams,
  ): Promise<Conversation> {
    const { creatorId, message: content, recipientId } = params;

    const recipient = await this.userService.findUserById(recipientId);

    if (!recipient) throw new UserNotFoundException();

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
        recipient: { select: this.selectUserFields() },
        creator: { select: this.selectUserFields() },
        messages: { include: { author: { select: this.selectUserFields() } } },
      },
    });

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
    const { paginationParams, userId } = params;

    const { take, skip } = getPaginationParams(paginationParams);

    const conversations = await this.prismaService.conversation.findMany({
      where: {
        AND: [{ creatorId: userId }, { recipientId: userId }],
      },
      take,
      skip,
      include: {
        creator: { select: this.selectUserFields() },
        recipient: { select: this.selectUserFields() },
        lastMessage: true,
        _count: {
          select: { messages: { where: { isReaded: false } } },
        },
      },
    });

    const conversationsCount = await this.prismaService.conversation.count({
      where: { AND: [{ creatorId: userId }, { recipientId: userId }] },
    });

    const transformedConversations = conversations.map((conversation) =>
      this.transformConversation(conversation),
    );

    return {
      results: transformedConversations,
      meta: getPaginationMeta(paginationParams, conversationsCount),
    };
  }

  async hasAccess(params: AccessParams): Promise<boolean> {
    const { conversationId, userId } = params;

    const conversation = await this.getConversationById(conversationId);

    if (!conversation) throw new ConversationNotFoundException();

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
        recipient: { select: this.selectUserFields() },
        creator: { select: this.selectUserFields() },
        lastMessage: true,
        _count: {
          select: { messages: { where: { isReaded: false } } },
        },
      },
    });

    return this.transformConversation(updateConversation);
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
        recipient: { select: this.selectUserFields() },
        creator: { select: this.selectUserFields() },
        lastMessage: true,
        _count: {
          select: { messages: { where: { isReaded: false } } },
        },
      },
    });

    return this.transformConversation(updateConversation);
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
