import { IsNumberString } from 'class-validator';

export class FindUniqueUserParams {
  @IsNumberString({}, { message: 'Параметр :id должно быть числом' })
  id: number;
}
