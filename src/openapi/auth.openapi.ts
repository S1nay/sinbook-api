import { ApiProperty, PickType } from '@nestjs/swagger';

import { UserOpenApi } from './user.openapi';

export namespace AuthOpenApi {
  export class JwtTokens {
    @ApiProperty({
      description: 'Токен доступа',
      type: String,
      example: 'token123',
    })
    access: string;

    @ApiProperty({
      description: 'Токен обновления',
      type: String,
      example: 'token123',
    })
    refresh: string;
  }
  //Auth Response
  export class AuthResponse extends JwtTokens {
    @ApiProperty({
      description: 'Профиль пользователя',
      type: UserOpenApi.CreateUserResponse,
    })
    user: () => UserOpenApi.CreateUserResponse;
  }

  //Register Dto
  export class RegisterDto extends UserOpenApi.CreateUserDto {
    @ApiProperty({
      description: 'Поле пароля юзера',
      nullable: false,
      minLength: 8,
      maxLength: 50,
      type: String,
      example: '123456789',
    })
    password: string;
  }

  //Login Dto
  export class LoginDto extends PickType(RegisterDto, ['password', 'email']) {}
}
