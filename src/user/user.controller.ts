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
import { UserOpenApi } from '#openapi/user.openapi';
import { User } from '#utils/decorators';
import { ParamIdValidationPipe, TransformGenderPipe } from '#utils/pipes';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user.exceptions';
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
