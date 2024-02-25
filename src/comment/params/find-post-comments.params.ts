import { IsNumberString } from 'class-validator';

export class FindPostCommentsParams {
  @IsNumberString({}, { message: 'Параметр :postId должно быть числом' })
  postId: number;
}
