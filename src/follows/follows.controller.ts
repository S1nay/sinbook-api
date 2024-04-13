import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { UserOpenApi } from '#openapi/user.openapi';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import {
  FollowIsAlreadyExistException,
  FollowIsNotExistException,
} from './exceptions/follows.exceptions';
import { FollowsService } from './follows.service';

@ApiBearerAuth()
@ApiTags('Подписки')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @ApiOkResponse({ type: UserOpenApi.ShortUser, isArray: true })
  @ApiException(() => [UserNotAuthorizedException])
  @Get('me/followers')
  findMyFollowers(@User() userId: number) {
    return this.followsService.getFollowers(userId);
  }

  @ApiOkResponse({ type: UserOpenApi.ShortUser, isArray: true })
  @ApiException(() => [UserNotAuthorizedException])
  @Get('me/following')
  findMyFollows(@User() userId: number) {
    return this.followsService.getFollows(userId);
  }

  @ApiOkResponse({ type: UserOpenApi.ShortUser, isArray: true })
  @ApiException(() => [UserNotAuthorizedException])
  @ApiParam({ type: Number, example: 1, name: 'userId' })
  @Get(':userId/followers')
  findUserFollowers(@Param('userId', ParamIdValidationPipe) userId: number) {
    return this.followsService.getFollowers(userId);
  }

  @ApiOkResponse({ type: UserOpenApi.ShortUser, isArray: true })
  @ApiException(() => [UserNotAuthorizedException])
  @ApiParam({ type: Number, example: 1, name: 'userId' })
  @Get(':userId/following')
  findUserFollows(@Param('userId', ParamIdValidationPipe) userId: number) {
    return this.followsService.getFollows(userId);
  }

  @ApiOkResponse()
  @ApiException(() => [
    UserNotAuthorizedException,
    FollowIsAlreadyExistException,
  ])
  @ApiParam({ type: Number, example: 1, name: 'followingUserId' })
  @Patch(':followingUserId')
  followUser(
    @User() userId: number,
    @Param('followingUserId', ParamIdValidationPipe) followingUserId: number,
  ) {
    return this.followsService.followUser({ userId, followingUserId });
  }

  @ApiOkResponse()
  @ApiException(() => [UserNotAuthorizedException, FollowIsNotExistException])
  @ApiParam({ type: Number, example: 1, name: 'followingUserId' })
  @Delete(':followingUserId')
  unFollowUser(
    @User() userId: number,
    @Param('followingUserId', ParamIdValidationPipe) followingUserId: number,
  ) {
    return this.followsService.unFollowUser({ userId, followingUserId });
  }
}
