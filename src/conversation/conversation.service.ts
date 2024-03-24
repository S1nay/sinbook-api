import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { PrismaService } from '#prisma/prisma.service';
import { exclude } from '#utils/excludeFields';

import {
  CheckConversationIsExistParams,
  CreateConversationParams,
  SetConversationLastMessageParams,
  UpdateMessageCountParams,
} from './types/conversation.types';

@Injectable()
export class ConversationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createConversation({
    senderId,
    recipientId,
  }: CreateConversationParams) {
    await this.checkConvesationIsExistByMembers({ recipientId, senderId });

    const conversation = await this.prismaService.conversation.create({
      data: {
        name: '',
        members: {
          create: [
            { member: { connect: { id: senderId } } },
            { member: { connect: { id: recipientId } } },
          ],
        },
      },
    });

    return exclude(conversation, ['lastMessagId']);
  }

  async getConversations(userId: number) {
    const conversations = await this.prismaService.conversation.findMany({
      where: {
        members: {
          some: {
            memberId: userId,
          },
        },
      },
      include: {
        lastMessage: true,
        members: {
          include: {
            member: {
              select: {
                id: true,
                avatarPath: true,
                name: true,
                secondName: true,
              },
            },
          },
        },
      },
    });

    return conversations.map((conversation) => ({
      ...exclude(conversation, ['lastMessagId', 'members']),
      lastMessage: exclude(conversation.lastMessage, ['conversationId']),
      chatMember: {
        ...conversation.members.find((member) => member.memberId !== userId)
          .member,
      },
    }));
  }

  async getConversationInfo(conversationId: number) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                secondName: true,
                avatarPath: true,
              },
            },
          },
        },
      },
    });

    return {
      ...conversation,
      messages: conversation.messages.map((message) =>
        exclude(message, ['senderId', 'conversationId']),
      ),
    };
  }

  async getConversationById(conversationId: number) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new WsException('Чат не найден');
    }

    return conversation;
  }

  async checkConvesationIsExistByMembers({
    recipientId,
    senderId,
  }: CheckConversationIsExistParams) {
    const conversation = await this.prismaService.conversation.findFirst({
      where: {
        members: {
          some: {
            member: {
              id: {
                in: [recipientId, senderId],
              },
            },
          },
        },
      },
    });

    if (conversation) {
      throw new WsException('Чат уже существует');
    }
  }

  async setConversationLastMessage(params: SetConversationLastMessageParams) {
    const { conversationId, messageId } = params;

    await this.getConversationById(conversationId);

    const updatedConversation = await this.prismaService.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessage: messageId
          ? {
              connect: {
                id: messageId,
              },
            }
          : {
              disconnect: true,
            },
      },
      include: {
        lastMessage: true,
      },
    });

    return exclude(updatedConversation, ['lastMessagId']);
  }

  async updateMessageCount({
    conversationId,
    isClear,
    isDelete,
  }: UpdateMessageCountParams) {
    const conversation = await this.getConversationById(conversationId);

    const messageCount = isDelete
      ? conversation.unreadMessagesCount - 1
      : conversation.unreadMessagesCount + 1;

    await this.prismaService.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        unreadMessagesCount: isClear ? 0 : messageCount,
      },
    });
  }
}
