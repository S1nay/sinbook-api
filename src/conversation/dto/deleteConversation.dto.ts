import { IsInt } from 'class-validator';

export class DeleteConversationDto {
  @IsInt({ message: 'Поле userId должно быть числом' })
  userId: number;

  @IsInt({ message: 'Поле conversationId должно быть числом' })
  conversationId: number;
}
