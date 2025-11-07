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
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const user = await this.validateLoginUser(loginParams);

    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async register(registerParams: RegisterParams): Promise<AuthUser> {
    const { email, password } = registerParams;

    const salt = await genSalt();

    delete registerParams.password;

    this.validateRegisterUser(email);

    const newUser = await this.userService.createUser({
      userData: {
        ...registerParams,
        email,
        passwordHash: await hash(password, salt),
        nickName: `@${registerParams.nickName}`,
      },
    });

    const tokens = await this.generateTokens(newUser);

    return {
      user: newUser,
      ...tokens,
    };
  }

  async validateLoginUser(loginParams: LoginParams): Promise<User> {
    const { email, password } = loginParams;

    const candidate = await this.userService.findUserByEmail(email);

    if (!candidate) {
      throw new UserWithEmailNotExistException();
    }

    const isCorrectPassword = await compare(password, candidate.passwordHash);

    if (!isCorrectPassword) {
      throw new IncorrectAuthDataException();
    }

    delete candidate.passwordHash;

    return candidate;
  }

  async validateRegisterUser(email: string): Promise<void> {
    const candidate = await this.userService.findUserByEmail(email);

    if (candidate) {
      throw new UserWithEmailExistException();
    }

    if (candidate) {
      throw new UserWithNicknameExistException();
    }
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
          email: userData.email,
        },
        {
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES'),
        },
      ),
    };
  }
}
