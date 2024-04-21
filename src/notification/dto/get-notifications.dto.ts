import { IsInt, IsOptional } from 'class-validator';

export class GetNotificationsDto {
  @IsOptional()
  @IsInt({ message: 'Поле page должно быть числом' })
  page: number;

  @IsOptional()
  @IsInt({ message: 'Поле perPage должно быть числом' })
  perPage: number;
}
