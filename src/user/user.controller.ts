import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { User } from 'src/decorators/user.decorator';
import { UserNotAuthorizedException } from 'src/auth/exceptions/auth-exceptions';

import { UserNotFoundException } from './exceptions/user-exceptions';
import {
  DeleteUserResponse,
  FindMeResponse,
  FindUniqueUserResponse,
  UpdateUserResponse,
} from './responses/user.responses';

@ApiBearerAuth()
@ApiTags('Пользователи')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: FindMeResponse })
  @ApiException(() => UserNotAuthorizedException)
  @Get('/me')
  findMe(@User() id: number) {
    return this.userService.findMyProfile(id);
  }

  @ApiOkResponse({ type: FindUniqueUserResponse })
  @ApiException(() => [UserNotAuthorizedException, UserNotFoundException])
  @ApiParam({ type: Number, example: 1, name: 'id' })
  @Get(':id')
  findUnique(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findUserById(id);
  }

  @ApiOkResponse({ type: UpdateUserResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @ApiBody({ type: UpdateUserDto })
  @Patch()
  update(@User() userId: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updateUserDto);
  }

  @ApiOkResponse({ type: DeleteUserResponse })
  @ApiException(() => [UserNotAuthorizedException])
  @Delete()
  delete(@User() userId: number) {
    return this.userService.softDeleteUser(userId);
  }
}
