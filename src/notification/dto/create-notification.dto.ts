export class CreateNotificationDto {
  recipientId: number;
  authorId: number;
  typeEntityId: number;
  type: 'follow' | 'comment' | 'like';
}
