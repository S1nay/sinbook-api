import { IsInt } from 'class-validator';

export class GetMessagesDto {
  @IsInt({ message: 'Поле page должно быть числом' })
  page: number;

  @IsInt({ message: 'Поле perPage должно быть числом' })
  perPage: number;
}
