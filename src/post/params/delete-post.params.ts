import { IsNumberString } from 'class-validator';

export class DeletePostParams {
  @IsNumberString({}, { message: 'Параметр :id должно быть числом' })
  id: number;
}
