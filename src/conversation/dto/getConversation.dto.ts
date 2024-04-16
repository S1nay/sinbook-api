import { IsInt } from 'class-validator';

export class GetConversationsDto {
  @IsInt({ message: 'Поле page должно быть числом' })
  page: number;

  @IsInt({ message: 'Поле perPage должно быть числом' })
  perPage: number;
}
