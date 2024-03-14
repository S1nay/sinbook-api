import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UserNotAuthorizedException } from '#auth/exceptions/auth.exceptions';
import { User } from '#decorators/user.decorator';
import { TransformGenderPipe } from '#user/pipes/gender-transform.pipe';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user.exceptions';
import { UserOpenApi } from './openapi/user.openapi';
import { FindUniqueUserParams } from './params/find-unique-user.params';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: UserOpenApi.FindMeResponse })
  @ApiException(() => UserNotAuthorizedException)
  @Get('/me')
  findMe(@User() id: number) {
    return this.userService.findMyProfile(id);
  }

  @ApiOkResponse({ type: UserOpenApi.FindUniqueUserResponse })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @ApiParam({ type: Number, example: 1, name: 'id' })
  @Get(':id')
  findUnique(@Param() params: FindUniqueUserParams) {
    return this.userService.findUserById(+params.id);
  }

  @ApiOkResponse({ type: UserOpenApi.UpdateUserResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @ApiBody({ type: UserOpenApi.UpdateUserDto })
  @Patch()
  update(
    @User() userId: number,
    @Body(TransformGenderPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @ApiOkResponse({ type: UserOpenApi.DeleteUserResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @Delete()
  delete(@User() userId: number) {
    return this.userService.softDeleteUser(userId);
  }
}
