import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

import { UserOpenApi } from './user.openapi';

export namespace AuthOpenApi {
  export class JwtTokens {
    @ApiProperty({
      description: 'Токен доступа',
      type: String,
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDc5MjI0ODIsImV4cCI6MTcwNzkyNjA4Mn0.b8BpIGNkFQ8iRF11yPWf7DGbvhZPcbxeaGXZdMm8Ayk',
    })
    access: string;

    @ApiProperty({
      description: 'Токен обновления',
      type: String,
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDc5MjI0ODIsImV4cCI6MTcwNzkyNjA4Mn0.b8BpIGNkFQ8iRF11yPWf7DGbvhZPcbxeaGXZdMm8Ayk',
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
  export class RegisterDto extends PartialType(UserOpenApi.CreateUserDto) {
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
