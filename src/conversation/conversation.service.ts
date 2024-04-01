import { Injectable } from '@nestjs/common';
import { Conversation as ConversationModel } from '@prisma/client';

import { PrismaService } from '#prisma/prisma.service';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { UserService } from '#user/user.service';
import { createObjectByKeys, exclude } from '#utils/helpers';
import { Conversation, ConversationInfo, ShortUserInfo } from '#utils/types';

import {
  CannotCreateConversationWithYourselfException,
  ConversationIsAlreadyExistException,
  ConversationNotFoundException,
} from './exceptions/conversation.exceptions';
import {
  AccessParams,
  CheckConversationIsCreatedParams,
  CreateConversationParams,
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

  async createConversation(params: CreateConversationParams) {
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
        lastMessage: null,
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

  async getConversationById(conversationId: number): Promise<ConversationInfo> {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        recipient: { select: this.selectUserFields() },
        creator: { select: this.selectUserFields() },
        messages: {
          include: { author: { select: this.selectUserFields() } },
        },
      },
    });

    return {
      ...conversation,
      messages: conversation.messages.map((message) =>
        exclude(message, ['authorId']),
      ),
    };
  }

  async checkConversationIsCreated({
    userId,
    recipientId,
  }: CheckConversationIsCreatedParams): Promise<ConversationModel> {
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

  async getConversations(userId: number): Promise<Conversation[]> {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        OR: [{ creatorId: userId }, { recipientId: userId }],
      },
      include: {
        creator: { select: this.selectUserFields() },
        recipient: { select: this.selectUserFields() },
        lastMessage: true,
      },
    });

    return conversations.map((conversation) => ({
      ...exclude(conversation, ['creatorId', 'recipientId', 'lastMessagId']),
    }));
  }

  async hasAccess({ conversationId, userId }: AccessParams): Promise<boolean> {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) throw new ConversationNotFoundException();
    return (
      conversation.creator.id === userId || conversation.recipient.id === userId
    );
  }

  async setLastConversationMessage({
    conversationId,
    messageId,
  }: SetLastConversationMessageParams): Promise<Conversation> {
    const selectUserFields = createObjectByKeys<ShortUserInfo>([
      'id',
      'name',
      'secondName',
      'avatarPath',
    ]);

    const updateConversation = await this.prismaService.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: messageId
          ? {
              connect: { id: messageId },
            }
          : null,
      },
      include: {
        recipient: { select: selectUserFields },
        creator: { select: selectUserFields },
        lastMessage: true,
      },
    });

    return exclude(updateConversation, [
      'lastMessagId',
      'creatorId',
      'recipientId',
    ]);
  }
}
