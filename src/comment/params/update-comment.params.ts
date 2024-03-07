import { IsNumberString } from 'class-validator';

export class UpdateCommentParams {
  @IsNumberString({}, { message: 'Параметр :id должно быть числом' })
  id: number;
}
