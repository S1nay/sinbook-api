import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Поле content должно быть строкой' })
  @IsNotEmpty({ message: 'Поле content не должно быть пустым' })
  content: string;
}
