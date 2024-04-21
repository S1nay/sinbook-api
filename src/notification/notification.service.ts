import { Injectable } from '@nestjs/common';

import { PrismaService } from '#prisma/prisma.service';
import {
  exclude,
  getPaginationMeta,
  getPaginationParams,
  getShortUserFields,
} from '#utils/helpers';
import { Notification, PaginationResponse } from '#utils/types';

import {
  CreateNotificationParams,
  GetNotificationsParams,
} from './types/notification.types';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(
    params: CreateNotificationParams,
  ): Promise<Notification> {
    const { content, recipientId, authorId, type, typeEntityId } = params;

    const notification = await this.prismaService.notification.create({
      data: {
        content,
        type,
        typeEntityId,
        recipient: { connect: { id: recipientId } },
        author: { connect: { id: authorId } },
        isReaded: false,
      },
      include: {
        author: { select: getShortUserFields() },
      },
    });

    const transformedNotification = exclude(notification, ['authorId']);

    return transformedNotification;
  }

  async readNotifications(recipientId: number): Promise<void> {
    await this.prismaService.notification.updateMany({
      where: { recipientId, isReaded: false },
      data: { isReaded: true },
    });
  }

  async getNotifications(
    params: GetNotificationsParams,
  ): Promise<PaginationResponse<Notification>> {
    const { paginationParams, userId } = params;

    const { skip, take } = getPaginationParams(paginationParams);

    const notifications = await this.prismaService.notification.findMany({
      skip,
      take,
      where: { recipientId: userId },
      include: {
        author: { select: getShortUserFields() },
      },
    });

    const notificationsCount = await this.prismaService.notification.count({
      where: { recipientId: userId },
    });

    const transformedNotifications = notifications.map((notification) =>
      exclude(notification, ['authorId']),
    );

    return {
      results: transformedNotifications,
      meta: getPaginationMeta(paginationParams, notificationsCount),
    };
  }
}
