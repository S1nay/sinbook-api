import { ApiProperty } from '@nestjs/swagger';

import { UserOpenApi } from './user.openapi';

export namespace FollowOpenApi {
  //FollowingUser model
  export class FollowingUser extends UserOpenApi.ShortUser {
    @ApiProperty({
      example: true,
      type: Boolean,
      description: 'Взаимная подписка',
    })
    mutualFollow: boolean;
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
