import { ApiProperty } from '@nestjs/swagger';
import { CreateUserResponse } from 'src/user/responses/user.responses';

export class AuthResponse {
  @ApiProperty({
    description: 'Профиль пользователя',
    type: CreateUserResponse,
  })
  user: CreateUserResponse;

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

export class RefreshToken {
  @ApiProperty({
    description: 'Токен обновления',
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDc5MjI0ODIsImV4cCI6MTcwNzkyNjA4Mn0.b8BpIGNkFQ8iRF11yPWf7DGbvhZPcbxeaGXZdMm8Ayk',
  })
  refresh: string;
}

export class AccessToken {
  @ApiProperty({
    description: 'Токен доступа',
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImV4YW1wbGVAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDc5MjI0ODIsImV4cCI6MTcwNzkyNjA4Mn0.b8BpIGNkFQ8iRF11yPWf7DGbvhZPcbxeaGXZdMm8Ayk',
  })
  access: string;
}
