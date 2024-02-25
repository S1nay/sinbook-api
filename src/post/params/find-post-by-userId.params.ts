import { IsNumberString } from 'class-validator';

export class FindPostByUserIdParams {
  @IsNumberString({}, { message: 'Параметр :userId должно быть числом' })
  userId: number;
}
