import { IsInt } from 'class-validator';

export class CreateConversationDto {
  @IsInt({ message: 'Поле senderId должно быть числом' })
  senderId: number;

  @IsInt({ message: 'Поле recipientId должно быть числом' })
  recipientId: number;
}
