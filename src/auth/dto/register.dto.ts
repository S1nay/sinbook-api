import { OmitType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

export class RegisterDto extends OmitType(CreateUserDto, [
  'passwordHash',
] as const) {
  @ApiProperty({
    description: 'Поле пароля юзера',
    nullable: false,
    minLength: 8,
    maxLength: 50,
    type: String,
    example: '123456789',
  })
  @IsString({ message: 'Поле password должно быть строкой' })
  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  @MinLength(8, { message: 'Длина пароля должна быть минимум 8 символов' })
  @MaxLength(50, { message: 'Длина пароля должна быть максимум 50 символов' })
  password?: string;
}
