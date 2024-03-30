import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString({ message: 'Поле content должно быть строкой' })
  content: string;
}
