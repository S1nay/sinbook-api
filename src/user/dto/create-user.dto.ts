import { Gender, Prisma } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsEmail({}, { message: 'Неверный формат email. Пример: test@test.com' })
  email: string;

  @IsString({ message: 'Поле hobby должно быть строкой' })
  @IsNotEmpty({ message: 'Поле hobby не должно быть пустым' })
  hobby: string;

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

  @IsDateString({}, { message: 'Поле birthDate должно быть строкой даты' })
  @IsOptional()
  birthDate: Date;

  @IsNotEmpty({ message: 'Поле gender не должно быть пустым' })
  gender: Gender;
}
