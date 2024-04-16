import { ApiProperty } from '@nestjs/swagger';

export namespace Pagination {
  export class PaginationMeta {
    @ApiProperty({
      description: 'Кол-во найденых сущностей',
      example: 115,
      type: Number,
    })
    totalItems: number;

    @ApiProperty({
      description: 'Кол-во страниц с найдеными сущностями',
      example: 15,
      type: Number,
    })
    totalPages: number;

    @ApiProperty({
      description: 'Текущая страница',
      example: 5,
      type: Number,
    })
    page: number;

    @ApiProperty({
      description: 'Кол-во возвращаемых сущностей на одну страницу',
      example: 10,
      type: Number,
    })
    perPage: number;
  }
}
