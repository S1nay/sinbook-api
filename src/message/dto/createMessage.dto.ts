import { IsInt, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString({ message: 'Поле title должно быть строкой' })
  message: string;

  senderId: number;

  @IsInt({ message: 'Поле recipientId должно быть числом' })
  recipientId: number;

  @IsInt({ message: 'Поле conversationId должно быть числом' })
  conversationId: number;
}
