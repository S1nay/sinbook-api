import { UserService } from 'src/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from 'src/user/responses/user.response';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './reponses/auth.response';
import {
  INCORRECT_AUTH_DATA,
  USER_WITH_EMAIL_EXIST,
  USER_WITH_EMAIL_NOT_EXIST,
} from './constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser({
      authDto: loginDto,
      isRegister: false,
    });

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password } = registerDto;

    await this.validateUser({ authDto: registerDto, isRegister: true });

    const salt = await genSalt(15);

    delete registerDto.password;

    const newUser = await this.userService.createUser({
      ...registerDto,
      email,
      passwordHash: await hash(password, salt),
      birthDate: new Date(registerDto.birthDate),
    });

    return this.generateTokens(newUser);
  }

  async validateUser({
    authDto,
    isRegister,
  }: {
    authDto: LoginDto | RegisterDto;
    isRegister: boolean;
  }): Promise<UserResponse> {
    const { email, password } = authDto;

    const candidate = await this.userService.findOneByEmail(email);

    if (isRegister) {
      if (candidate) {
        throw new UnauthorizedException(USER_WITH_EMAIL_EXIST);
      }
    } else {
      if (!candidate) {
        throw new UnauthorizedException(USER_WITH_EMAIL_NOT_EXIST);
      }

      const isCorrectPassword = await compare(password, candidate.passwordHash);

      if (!isCorrectPassword) {
        throw new UnauthorizedException(INCORRECT_AUTH_DATA);
      }

      delete candidate.passwordHash;
    }

    return candidate;
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const userData = this.jwtService.decode(refresh);

    return {
      access: await this.jwtService.signAsync(
        {
          user_id: userData.id,
          email: userData.email,
        },
        {
          expiresIn: '60m',
        },
      ),
    };
  }

  async generateTokens(userData: UserResponse): Promise<AuthResponse> {
    return {
      user: userData,
      access: await this.jwtService.signAsync(
        {
          user_id: userData.id,
          email: userData.email,
        },
        {
          expiresIn: '60m',
        },
      ),
      refresh: await this.jwtService.signAsync(
        {
          user_id: userData.id,
          email: userData.email,
        },
        {
          expiresIn: '7d',
        },
      ),
    };
  }
}
