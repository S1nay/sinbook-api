import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { $Enums, Gender, User } from '@prisma/client';
import { PostEntity } from 'src/post/entities/post.entity';

class UserCountFields {
  @ApiProperty({
    description: 'Кол-во подписчиков',
    example: 1,
    type: Number,
  })
  followersCount?: number;

  @ApiProperty({
    description: 'Кол-во подписок',
    example: 1,
    type: Number,
  })
  followersOfCount?: number;
}

export class UserEntity extends UserCountFields implements User {
  @ApiProperty({
    description: 'Id пользователя',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Тест',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Тестов',
    type: String,
  })
  secondName: string;

  @ApiProperty({
    description: 'Отчество пользователя',
    example: 'Тестович',
    type: String,
  })
  middleName: string;

  passwordHash: string;

  @ApiProperty({
    description: 'email пользователя',
    example: 'example@example.com',
    format: 'email',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'Путь к аватару',
    example: 'http://localhost:5555/avatars/1/image.png',
    type: String,
    default: null,
  })
  avatarPath: string | null;

  @ApiProperty({
    description: 'Дата рождения пользователя',
    example: '2024-02-13T14:50:43.867Z',
    type: String,
    default: null,
  })
  birthDate: Date;

  @ApiProperty({
    description: 'Город пользователя',
    example: 'Санкт-Петербург',
    type: String,
    default: '',
  })
  city: string;

  @ApiProperty({
    description: 'Гендер пользователя',
    enum: Gender,
    enumName: 'Gender',
    nullable: false,
    required: true,
  })
  gender: $Enums.Gender;

  @ApiProperty({
    description: 'Статус удаленного аккаунта',
    example: false,
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Дата создания пользователя',
    example: '2024-02-13T14:50:43.867Z',
    type: String,
    default: '2024-02-13T14:50:43.867Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления пользователя',
    example: '2024-02-13T14:50:43.867Z',
    type: String,
    default: '2024-02-13T14:50:43.867Z',
  })
  updatedAt: Date;

  @ApiHideProperty()
  followers?: UserEntity[];

  @ApiHideProperty()
  followersOf?: UserEntity[];

  @ApiHideProperty()
  posts?: PostEntity[];
}
