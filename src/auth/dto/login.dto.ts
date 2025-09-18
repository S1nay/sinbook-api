import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

import { RegisterDto } from './register.dto';

export class LoginDto extends PickType(RegisterDto, ['email']) {
  @IsString({ message: 'Поле password должно быть строкой' })
  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  password: string;
}
