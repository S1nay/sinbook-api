import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TransformGenderPipe } from 'src/pipes/gender-transform.pipe';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from 'src/auth/guards/jwt-refresh-guard';
import { LoginDto } from './dto/login.dto';
import { SkipAuth } from 'src/decorators/skip-auth.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  IncorrectAuthDataException,
  InvalidTokenException,
  UserNotAuthorizedException,
  UserWithEmailExistException,
  UserWithEmailNotExistException,
} from './exceptions/auth-exceptions';
import { AuthOpenApi } from './openapi/auth.openapi';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: AuthOpenApi.AuthResponse })
  @ApiException(() => [
    UserWithEmailNotExistException,
    IncorrectAuthDataException,
  ])
  @ApiBody({ type: AuthOpenApi.LoginDto })
  @SkipAuth()
  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOkResponse({ type: AuthOpenApi.AuthResponse })
  @ApiException(() => [UserWithEmailExistException])
  @ApiBody({ type: AuthOpenApi.RegisterDto })
  @SkipAuth()
  @Post('sign-up')
  @HttpCode(200)
  signUp(@Body(TransformGenderPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: new AuthOpenApi.JwtTokens().access })
  @ApiException(() => [UserNotAuthorizedException, InvalidTokenException])
  @ApiBody({ type: new AuthOpenApi.JwtTokens().access })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() refreshToken: { refresh: string }) {
    return this.authService.refreshToken(refreshToken.refresh);
  }
}
