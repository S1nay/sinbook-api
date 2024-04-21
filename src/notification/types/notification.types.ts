import { PaginationParams } from '#utils/types';

export type CreateNotificationParams = {
  content: string;
  recipientId: number;
  authorId: number;
  type: 'post' | 'user';
  typeEntityId?: number;
};

export type GetNotificationsParams = {
  paginationParams: PaginationParams;
  userId: number;
};

export type NotificationData = {
  content: string;
  type: 'post' | 'user';
};
