import { IsInt } from 'class-validator';

export class CreateLikeDto {
  @IsInt({ message: 'Поле postId должно быть числом' })
  postId: number;
}
