import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import { exclude } from '#utils/excludeFields';

import { CreateConversationDto } from './dto/createConversation.dto';
import {
  CheckConversationIsExistParams,
  SetConversationLastMessageParams,
} from './types/conversation.types';

@Injectable()
export class ConversationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createConversation({ senderId, recipientId }: CreateConversationDto) {
    await this.checkConvesationIsExist({ recipientId, senderId });

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
      throw new NotFoundException('Чат не найден');
    }

    return conversation;
  }

  async checkConvesationIsExist({
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
      throw new BadRequestException('Чат уже существует');
    }
  }

  async setConversationLastMessage({
    conversationId,
    messageId,
  }: SetConversationLastMessageParams) {
    const conversation = await this.getConversationById(conversationId);

    return this.prismaService.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        unreadMessagesCount: conversation.unreadMessagesCount + 1,
        lastMessage: {
          connect: {
            id: messageId,
          },
        },
      },
      include: {
        lastMessage: true,
      },
    });
  }
}
