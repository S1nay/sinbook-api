import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsInt({ message: 'Поле recipientId должно быть числом' })
  recipientId: number;

  @IsString({ message: 'Поле message должно быть строкой' })
  @IsNotEmpty({ message: 'Поле message не может быть пустым' })
  message: string;
}
