import { IsInt } from 'class-validator';

export class DeleteMessageDto {
  @IsInt({ message: 'Поле messageId должно быть числом' })
  messageId: number;

  @IsInt({ message: 'Поле conversationId должно быть числом' })
  conversationId: number;

  @IsInt({ message: 'Поле recipientId должно быть числом' })
  recipientId: number;
}
