import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { FollowOpenApi } from '#openapi/follow.openapi';
import { UserNotFoundException } from '#user/exceptions/user.exceptions';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe } from '#utils/pipes';

import { CreateFollowDto } from './dto/create-follow.dto';
import { CouldNotFollowYorselfException } from './exceptions/follows.exceptions';
import { FollowsService } from './follows.service';

@ApiBearerAuth()
@ApiTags('Подписки')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @ApiOkResponse({ type: FollowOpenApi.FollowingUser })
  @ApiException(() => [
    UserNotAuthorizedException,
    CouldNotFollowYorselfException,
    UserNotFoundException,
  ])
  @ApiBody({ type: FollowOpenApi.CreateFollowDto })
  @Post()
  followUser(
    @User() userId: number,
    @Body() { followingUserId }: CreateFollowDto,
  ) {
    return this.followsService.followUser({ userId, followingUserId });
  }

  @ApiOkResponse({ type: FollowOpenApi.FollowingUser })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @ApiBody({ type: FollowOpenApi.CreateFollowDto })
  @Delete(':followingUserId')
  unFollowUser(
    @User() userId: number,
    @Param(ParamIdValidationPipe) followingUserId: number,
  ) {
    return this.followsService.followUser({ userId, followingUserId });
  }
}
