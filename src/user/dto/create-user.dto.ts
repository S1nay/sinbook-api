import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserEntity } from '../entities/user.entity';
import { OmitType } from '@nestjs/swagger';

export class CreateUserDto extends OmitType(UserEntity, [
  'createdAt',
  'updatedAt',
  'avatarPath',
  'id',
  'isDeleted',
  'posts',
  'followers',
  'followersOf',
]) {
  @IsEmail({}, { message: 'Неверный формат email. Пример: test@test.com' })
  email: string;

  @IsString({ message: 'Поле passwordHash должно быть строкой' })
  @IsNotEmpty({ message: 'Поле passwordHash не должно быть пустым' })
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

  @IsString({ message: 'Поле city должно быть строкой' })
  @IsOptional()
  city: string;

  @IsDateString({}, { message: 'Поле birthDate должно быть строкой даты' })
  @IsOptional()
  birthDate: Date;

  @IsNotEmpty({ message: 'Поле gender не должно быть пустым' })
  gender: Gender;
}
