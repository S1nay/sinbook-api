import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TransformGenderPipe } from 'src/pipes/gender-transform.pipe';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from 'src/guards/jwt-refresh-guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('sign-up')
  @HttpCode(200)
  async signUp(@Body(TransformGenderPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() refreshToken: { refresh: string }) {
    return this.authService.refreshToken(refreshToken.refresh);
  }
}
