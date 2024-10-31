import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { compare, genSalt, hash } from 'bcryptjs';

import { UserService } from '#user/user.service';
import { AuthUser, JwtTokens, TokenInfo } from '#utils/types';

import {
  IncorrectAuthDataException,
  UserNotAuthorizedException,
  UserWithEmailExistException,
  UserWithEmailNotExistException,
  UserWithNicknameExistException,
} from './exceptions/auth.exceptions';
import {
  GenerateTokensParam,
  LoginParams,
  RegisterParams,
} from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginParams: LoginParams): Promise<AuthUser> {
    const user = await this.validatePassword(loginParams);

    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async register(registerParams: RegisterParams): Promise<AuthUser> {
    const { email, password } = registerParams;

    const salt = await genSalt(15);

    delete registerParams.password;

    const newUser = await this.userService.createUser({
      userData: {
        ...registerParams,
        email,
        passwordHash: await hash(password, salt),
        birthDate: new Date(registerParams.birthDate),
        nickName: `@${registerParams.nickName}`,
      },
    });

    const tokens = await this.generateTokens(newUser);

    return {
      user: newUser,
      ...tokens,
    };
  }

  async validateLoginEmail(email: string): Promise<boolean> {
    const candidate = await this.userService.findUserByEmail(email);

    if (!candidate) {
      throw new UserWithEmailNotExistException();
    }
    return true;
  }

  async validateRegisterEmail(email: string): Promise<boolean> {
    const candidate = await this.userService.findUserByEmail(email);

    if (candidate) {
      throw new UserWithEmailExistException();
    }

    return true;
  }

  async validateRegisterNickname(nickName: string): Promise<boolean> {
    const candidate = await this.userService.findUserByNickName(nickName);

    if (candidate) {
      throw new UserWithNicknameExistException();
    }

    return true;
  }

  async validatePassword(params: LoginParams): Promise<User> {
    const { email, password } = params;

    const candidate = await this.userService.findUserByEmail(email);

    const isCorrectPassword = await compare(password, candidate.passwordHash);

    if (!isCorrectPassword) {
      throw new IncorrectAuthDataException();
    }

    delete candidate.passwordHash;

    return candidate;
  }

  async validateUserToken(token: string): Promise<TokenInfo> {
    const userData: TokenInfo = this.jwtService.decode(token);

    const user = await this.userService.findUserById(userData.id, true);

    if (!user) {
      throw new UserNotAuthorizedException();
    }

    return userData;
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const userData = await this.validateUserToken(refresh);

    return {
      access: (await this.generateTokens(userData)).access,
    };
  }

  async generateTokens(userData: GenerateTokensParam): Promise<JwtTokens> {
    return {
      access: await this.jwtService.signAsync(
        {
          id: userData.id,
          nickName: userData.nickName,
          name: userData.name,
          gender: userData.gender,
          email: userData.email,
        },
        {
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES'),
        },
      ),
      refresh: await this.jwtService.signAsync(
        {
          id: userData.id,
          nickName: userData.nickName,
          name: userData.name,
          gender: userData.gender,
          email: userData.email,
        },
        {
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES'),
        },
      ),
    };
  }
}
