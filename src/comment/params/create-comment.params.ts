import { IsNumberString } from 'class-validator';

export class CreateCommentParams {
  @IsNumberString({}, { message: 'Параметр :postId должно быть числом' })
  postId: number;
}
