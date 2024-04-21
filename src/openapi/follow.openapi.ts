import { ApiProperty } from '@nestjs/swagger';

import { Pagination } from './pagination.openapi';
import { UserOpenApi } from './user.openapi';

export namespace FollowOpenApi {
  export class FollowingUser extends UserOpenApi.ShortUser {
    @ApiProperty({
      example: true,
      type: Boolean,
      description: 'Взаимная подписка',
    })
    mutualFollow: boolean;
  }

  export class FindFollowsUsers {
    @ApiProperty({
      description: 'Пользователи',
      type: FollowingUser,
      isArray: true,
    })
    results: () => FollowingUser[];

    @ApiProperty({
      description: 'Мета пагинации',
      type: Pagination.PaginationMeta,
    })
    meta: () => Pagination.PaginationMeta;
  }

  //Create Follow Response
  export class CreateFollowDto {
    @ApiProperty({
      description: 'id пользователя на которого идет подписка',
      type: Number,
      example: 1,
    })
    followingUserId: number;
  }
}
