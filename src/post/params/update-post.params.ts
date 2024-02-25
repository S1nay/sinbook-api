import { IsNumberString } from 'class-validator';

export class UpdatePostParams {
  @IsNumberString({}, { message: 'Параметр :id должно быть числом' })
  id: number;
}
