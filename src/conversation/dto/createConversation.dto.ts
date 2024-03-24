import { IsInt } from 'class-validator';

export class CreateConversationDto {
  senderId: number;

  @IsInt({ message: 'Поле recipientId должно быть числом' })
  recipientId: number;
}
