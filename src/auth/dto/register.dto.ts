import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { CreateUserDto } from '#user/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @IsString({ message: 'Поле password должно быть строкой' })
  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  @MinLength(8, { message: 'Длина пароля должна быть минимум 8 символов' })
  @MaxLength(50, { message: 'Длина пароля должна быть максимум 50 символов' })
  password: string;
}
