import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { UserOpenApi } from '#openapi/user.openapi';
import { Pagination, User } from '#utils/decorators';
import {
  ParamBoolValidationPipe,
  ParamIdValidationPipe,
  TransformGenderPipe,
} from '#utils/pipes';
import { PaginationParams } from '#utils/types';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user.exceptions';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: UserOpenApi.FindAllUsers })
  @ApiException(() => UserNotAuthorizedException)
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
  @ApiQuery({
    type: Boolean,
    example: true,
    name: 'followers',
    required: false,
  })
  @ApiQuery({
    type: Boolean,
    example: true,
    name: 'follows',
    required: false,
  })
  @ApiQuery({ type: Number, example: 1, name: 'userId', required: false })
  @Get()
  findAll(
    @Pagination() params: PaginationParams,
    @Query('userId', ParamIdValidationPipe) userId: string,
    @Query('follows', ParamBoolValidationPipe) follows: string,
    @Query('followers', ParamBoolValidationPipe) followers: string,
  ) {
    return this.userService.findUsers({
      ...params,
      userId: +userId,
      follows: Boolean(follows),
      followers: Boolean(followers),
    });
  }

  @ApiOkResponse({ type: UserOpenApi.FindMeResponse })
  @ApiException(() => UserNotAuthorizedException)
  @Get('me')
  findMe(@User() id: number) {
    return this.userService.findMyProfile(id);
  }

  @ApiOkResponse({ type: UserOpenApi.FindUniqueUserResponse })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @ApiParam({ type: Number, example: 1, name: 'id' })
  @Get(':id')
  findUnique(@Param('id', ParamIdValidationPipe) id: number) {
    return this.userService.findUserById(id);
  }

  @ApiOkResponse({ type: UserOpenApi.UpdateUserResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @ApiBody({ type: UserOpenApi.UpdateUserDto })
  @Patch()
  update(
    @User() userId: number,
    @Body(TransformGenderPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.editUser({ userData: updateUserDto, userId });
  }

  @ApiOkResponse({ type: UserOpenApi.DeleteUserResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @Delete()
  delete(@User() userId: number) {
    return this.userService.softDeleteUser(userId);
  }
}
