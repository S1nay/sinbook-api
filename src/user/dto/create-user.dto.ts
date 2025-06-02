import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsEmail({}, { message: 'Неверный формат email. Пример: test@test.com' })
  email: string;

  @IsString({ message: 'Поле biography должно быть строкой' })
  @IsNotEmpty({ message: 'Поле biography не должно быть пустым' })
  biography: string;

  @IsString({ message: 'Поле nickName должно быть строкой' })
  @IsNotEmpty({ message: 'Поле nickName не должно быть пустым' })
  nickName: string;

  passwordHash: string;

  @IsString({ message: 'Поле avatarPath должно быть строкой' })
  @IsOptional()
  avatarPath: string;

  @IsString({ message: 'Поле name должно быть строкой' })
  @IsNotEmpty({ message: 'Поле name не должно быть пустым' })
  name: string;
}

