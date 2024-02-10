import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail(
    {},
    { message: 'Неверный формат email. Пример: example@example.com' },
  )
  email: string;

  @IsString({ message: 'Поле password должно быть строкой' })
  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  @MinLength(8, { message: 'Длина пароля должна быть минимум 8 символов' })
  @MaxLength(50, { message: 'Длина пароля должна быть максимум 50 символов' })
  passwordHash: string;

  @IsString({ message: 'Поле name должно быть строкой' })
  @IsNotEmpty({ message: 'Поле name не должно быть пустым' })
  name: string;

  @IsString({ message: 'Поле secondName должно быть строкой' })
  @IsNotEmpty({ message: 'Поле secondName не должно быть пустым' })
  secondName: string;

  @IsString({ message: 'Поле middleName должно быть строкой' })
  @IsNotEmpty({ message: 'Поле middleName не должно быть пустым' })
  middleName: string;

  @IsString({ message: 'Поле avatarPath должно быть строкой' })
  @IsOptional()
  avatarPath: string;

  @IsString({ message: 'Поле city должно быть строкой' })
  @IsNotEmpty({ message: 'Поле city не должно быть пустым' })
  city: string;

  @IsDateString({}, { message: 'Поле birthDate должно быть строкой даты' })
  @IsNotEmpty({ message: 'Поле birthDate не должно быть пустым' })
  birthDate: Date;

  @IsNotEmpty({ message: 'Поле gender не должно быть пустым' })
  gender: Gender;
}
