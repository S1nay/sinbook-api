import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './reponses/auth.response';
import {
  UserWithEmailNotExistException,
  IncorrectAuthDataException,
  UserWithEmailExistException,
} from './exceptions/auth-exceptions';
import {
  CreateUserResponse,
  FindEmalUserResponse,
} from 'src/user/responses/user.responses';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
  }): Promise<FindEmalUserResponse> {
    const { email, password } = authDto;

    const candidate = await this.userService.findUserByEmail(email);

    if (isRegister) {
      if (candidate) {
        throw new UserWithEmailExistException();
      }
    } else {
      if (!candidate) {
        throw new UserWithEmailNotExistException();
      }

      const isCorrectPassword = await compare(password, candidate.passwordHash);

      if (!isCorrectPassword) {
        throw new IncorrectAuthDataException();
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
          user_id: userData.user_id,
          email: userData.email,
        },
        {
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES'),
        },
      ),
    };
  }

  async generateTokens(
    userData: CreateUserResponse | FindEmalUserResponse,
  ): Promise<AuthResponse> {
    return {
      user: userData,
      access: await this.jwtService.signAsync(
        {
          user_id: userData.id,
          email: userData.email,
        },
        {
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES'),
        },
      ),
      refresh: await this.jwtService.signAsync(
        {
          user_id: userData.id,
          email: userData.email,
        },
        {
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES'),
        },
      ),
    };
  }
}
