import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserActionGuard } from 'src/guards/user-action.guard';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { User } from 'src/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@User() id: number) {
    return this.userService.getMyProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard, UserActionGuard)
  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, UserActionGuard)
  @Delete(':id')
  softDeleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.softDelete(id);
  }
}
