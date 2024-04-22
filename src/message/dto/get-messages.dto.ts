import { IsInt, IsOptional, IsString } from 'class-validator';

export class GetMessagesDto {
  @IsOptional()
  @IsInt({ message: 'Поле page должно быть числом' })
  page?: number;

  @IsOptional()
  @IsInt({ message: 'Поле perPage должно быть числом' })
  perPage?: number;

  @IsOptional()
  @IsString({ message: 'Поле search должно быть строкой' })
  search?: string;
}
