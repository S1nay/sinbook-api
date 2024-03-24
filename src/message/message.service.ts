import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { PrismaService } from '#prisma/prisma.service';
import { exclude } from '#utils/excludeFields';

import { CreateMessageDto } from './dto/createMessage.dto';
import { UpdateMessageDto } from './dto/updateMessage.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    const { senderId, conversationId, message } = createMessageDto;

    const createdMessage = await this.prismaService.message.create({
      data: {
        message,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversationId } },
      },
      include: {
        sender: {
          select: {
            id: true,
            avatarPath: true,
            name: true,
            secondName: true,
          },
        },
      },
    });

    return exclude(createdMessage, ['senderId']);
  }

  async getMessagById(messageId: number) {
    const message = await this.prismaService.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new WsException('Сообщение не найдено');
    }

    return message;
  }

  async deleteMessage(messageId: number) {
    await this.getMessagById(messageId);

    return this.prismaService.message.delete({
      where: { id: messageId },
    });
  }

  async getLastConversationMessage(conversationId: number) {
    return this.prismaService.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        id: 'desc',
      },
      take: 1,
    });
  }

  async updateMessage(messageId: number, updateMessageDto: UpdateMessageDto) {
    const { conversationId, message, senderId } = updateMessageDto;

    await this.getMessagById(messageId);

    return this.prismaService.message.update({
      where: { id: messageId },
      data: {
        message,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversationId } },
        updatedAt: new Date(),
      },
    });
  }
}
