import { UserWithoutEmailWithFollowCount } from '#utils/types';

import { NotificationData } from '../types/notification.types';

export function getNotificationData(
  type: 'follow' | 'like' | 'comment',
  user: UserWithoutEmailWithFollowCount,
): NotificationData {
  const notificationData = {
    content: '',
    type: 'post',
  } as NotificationData;

  switch (type) {
    case 'like':
      notificationData.content = `${user.name}  поставил лайк на ваш пост`;
      notificationData.type = 'post';
      break;
    case 'follow':
      notificationData.content = `${user.name}  подписался на вас`;
      notificationData.type = 'user';
      break;
    case 'comment':
      notificationData.content = `${user.name} оставил комментарий на вашем посте`;
      notificationData.type = 'user';
  }

  return notificationData;
}
