import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compare, genSalt, hash } from 'bcryptjs';

import { UserService } from '#user/user.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  IncorrectAuthDataException,
  UserWithEmailExistException,
  UserWithEmailNotExistException,
  UserWithNicknameExistException,
} from './exceptions/auth-exceptions';
import { JwtTokens } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: Omit<User, 'passwordHash'> } & JwtTokens> {
    const user = await this.validateUser({
      authDto: loginDto,
      isRegister: false,
    });

    return this.generateTokens(user);
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: Omit<User, 'passwordHash'> } & JwtTokens> {
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
  }): Promise<User> {
    const { email, password } = authDto;

    const candidate = await this.userService.findUserByEmail(email);

    if (isRegister) {
      if (candidate) {
        throw new UserWithEmailExistException();
      }
      if ('nickName' in authDto && candidate.nickName === authDto.nickName) {
        throw new UserWithNicknameExistException();
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
    userData: Omit<User, 'passwordHash'> | User,
  ): Promise<{ user: Omit<User, 'passwordHash'> } & JwtTokens> {
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
