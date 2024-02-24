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
import {
  AccessToken,
  AuthResponse,
  RefreshToken,
} from './reponses/auth.response';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  IncorrectAuthDataException,
  InvalidTokenException,
  UserNotAuthorizedException,
  UserWithEmailExistException,
  UserWithEmailNotExistException,
} from './exceptions/auth-exceptions';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: AuthResponse })
  @ApiException(() => [
    UserWithEmailNotExistException,
    IncorrectAuthDataException,
  ])
  @ApiBody({ type: LoginDto })
  @SkipAuth()
  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOkResponse({ type: AuthResponse })
  @ApiException(() => [UserWithEmailExistException])
  @ApiBody({ type: RegisterDto })
  @SkipAuth()
  @Post('sign-up')
  @HttpCode(200)
  signUp(@Body(TransformGenderPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: AccessToken })
  @ApiException(() => [UserNotAuthorizedException, InvalidTokenException])
  @ApiBody({ type: RefreshToken })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() refreshToken: RefreshToken) {
    return this.authService.refreshToken(refreshToken.refresh);
  }
}
