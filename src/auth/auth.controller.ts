import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { SkipAuth } from '#utils/decorators';

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

  @ApiException(() => [
    IncorrectAuthDataException,
    UserWithEmailNotExistException,
  ])
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
  @ApiException(() => [
    UserWithEmailExistException,
    UserWithNicknameExistException,
  ])
  @SkipAuth()
  @Post('sign-up')
  @HttpCode(200)
  signUp(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
