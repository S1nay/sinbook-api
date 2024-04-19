import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { FollowOpenApi } from '#openapi/follow.openapi';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { Pagination, User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';
import { PaginationParams } from '#utils/types';

import { CouldNotFollowYorselfException } from './exceptions/follows.exceptions';
import { FollowsService } from './follows.service';

@ApiBearerAuth()
@ApiTags('Подписки')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @ApiOkResponse({ type: FollowOpenApi.FindFollowsUsers })
  @ApiQuery({
    type: String,
    example: 'name',
    name: 'search',
    required: false,
  })
  @ApiQuery({ type: Number, example: 1, name: 'page', required: false })
  @ApiQuery({
    type: Number,
    example: 15,
    name: 'perPage',
    required: false,
  })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @Get('me/followers')
  findMyFollowers(
    @User() userId: number,
    @Pagination() params: PaginationParams,
    @Query('search') search: string,
  ) {
    return this.followsService.getFollowers({
      paginationParams: { ...params, search },
      userId,
    });
  }

  @ApiOkResponse({ type: FollowOpenApi.FindFollowsUsers })
  @ApiQuery({ type: String, example: 'name', name: 'search' })
  @ApiQuery({ type: Number, example: 1, name: 'page' })
  @ApiQuery({ type: Number, example: 15, name: 'perPage' })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @Get('me/following')
  findMyFollows(
    @User() userId: number,
    @Pagination() params: PaginationParams,
    @Query('search') search: string,
  ) {
    return this.followsService.getFollows({
      paginationParams: { ...params, search },
      userId,
    });
  }

  @ApiOkResponse({ type: FollowOpenApi.FindFollowsUsers })
  @ApiQuery({ type: String, example: 'name', name: 'search' })
  @ApiQuery({ type: Number, example: 1, name: 'page' })
  @ApiQuery({ type: Number, example: 15, name: 'perPage' })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @ApiParam({ type: Number, example: 1, name: 'userId' })
  @Get(':userId/followers')
  findUserFollowers(
    @Param('userId', ParamIdValidationPipe) userId: number,
    @Pagination() params: PaginationParams,
  ) {
    return this.followsService.getFollowers({
      paginationParams: { ...params },
      userId,
    });
  }

  @ApiOkResponse({ type: FollowOpenApi.FindFollowsUsers })
  @ApiQuery({ type: String, example: 'name', name: 'search' })
  @ApiQuery({ type: Number, example: 1, name: 'page' })
  @ApiQuery({ type: Number, example: 15, name: 'perPage' })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @ApiParam({ type: Number, example: 1, name: 'userId' })
  @Get(':userId/following')
  findUserFollows(
    @Param('userId', ParamIdValidationPipe) userId: number,
    @Pagination() params: PaginationParams,
  ) {
    return this.followsService.getFollows({
      paginationParams: { ...params },
      userId,
    });
  }

  @ApiOkResponse({ type: FollowOpenApi.FollowingUser })
  @ApiException(() => [
    UserNotAuthorizedException,
    CouldNotFollowYorselfException,
    UserNotFoundException,
  ])
  @ApiParam({ type: Number, example: 1, name: 'followingUserId' })
  @Patch(':followingUserId')
  followUser(
    @User() userId: number,
    @Param('followingUserId', ParamIdValidationPipe) followingUserId: number,
  ) {
    return this.followsService.followUser({ userId, followingUserId });
  }
}
