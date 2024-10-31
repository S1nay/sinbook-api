import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { SkipAuth } from '#utils/decorators';
import { TransformGenderPipe } from '#utils/pipes';

import { AuthOpenApi } from '../openapi/auth.openapi';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  IncorrectAuthDataException,
  InvalidTokenException,
  UserWithEmailExistException,
  UserWithEmailNotExistException,
  UserWithNicknameExistException,
} from './exceptions/auth.exceptions';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthService } from './auth.service';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiException(() => [IncorrectAuthDataException])
  @ApiOkResponse({ type: AuthOpenApi.AuthResponse })
  @ApiBody({ type: AuthOpenApi.LoginDto })
  @SkipAuth()
  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOkResponse({ type: AuthOpenApi.AuthResponse })
  @ApiBody({ type: AuthOpenApi.RegisterDto })
  @SkipAuth()
  @Post('sign-up')
  @HttpCode(200)
  signUp(@Body(TransformGenderPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiException(() => [UserWithEmailNotExistException])
  @ApiParam({ name: 'email' })
  @SkipAuth()
  @Get('validate-login-email/:email')
  @HttpCode(200)
  validateLoginEmail(@Param('email') email: string) {
    return this.authService.validateLoginEmail(email);
  }

  @ApiException(() => [UserWithEmailExistException])
  @ApiParam({ name: 'email' })
  @SkipAuth()
  @Get('validate-register-email/:email')
  @HttpCode(200)
  validateRegisterEmail(@Param('email') email: string) {
    return this.authService.validateRegisterEmail(email);
  }

  @ApiException(() => [UserWithNicknameExistException])
  @ApiParam({ name: 'nickname' })
  @SkipAuth()
  @Get('validate-register-nickname/:nickname')
  @HttpCode(200)
  validateRegisterNickname(@Param('nickname') nickName: string) {
    return this.authService.validateRegisterNickname(nickName);
  }

  @SkipAuth()
  @ApiOkResponse({ type: new AuthOpenApi.JwtTokens().access })
  @ApiException(() => [InvalidTokenException])
  @ApiBody({ type: new AuthOpenApi.JwtTokens().refresh })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() refreshToken: { refresh: string }) {
    return this.authService.refreshToken(refreshToken.refresh);
  }
}
