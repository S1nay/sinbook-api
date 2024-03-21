import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString({ message: 'Поле title должно быть строкой' })
  @IsNotEmpty({ message: 'Поле title не должно быть пустым' })
  message: string;

  @IsInt({ message: 'Поле senderId должно быть числом' })
  @IsNotEmpty({ message: 'Поле senderId является обязательным' })
  senderId: number;

  @IsInt({ message: 'Поле recipientId должно быть числом' })
  @IsNotEmpty({ message: 'Поле recipientId является обязательным' })
  recipientId: number;

  @IsInt({ message: 'Поле conversationId должно быть числом' })
  @IsOptional()
  conversationId: number;
}
