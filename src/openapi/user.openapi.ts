import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { $Enums, Gender } from '@prisma/client';

import { User } from '#utils/types';

import { CommentOpenApi } from './comment.openapi';
import { Pagination } from './pagination.openapi';
import { PostOpenApi } from './post.openapi';

export namespace UserOpenApi {
  // Count Fields of User
  export class UserModelCountFields {
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

  // User Model
  export class UserModel extends UserModelCountFields implements User {
    @ApiProperty({
      description: 'Id пользователя',
      example: 1,
      type: Number,
    })
    id: number;

    @ApiProperty({
      description: 'Никнейм пользователя',
      example: '@Nickname',
      type: String,
    })
    nickName: string;

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
    followers?: () => UserModel[];

    @ApiHideProperty()
    followersOf?: () => UserModel[];

    @ApiHideProperty()
    posts?: () => PostOpenApi.PostModel[];

    @ApiHideProperty()
    comments?: () => CommentOpenApi.CommentModel[];
  }

  export class ShortUser extends PickType(UserModel, [
    'id',
    'name',
    'secondName',
    'nickName',
    'avatarPath',
  ]) {}

  //Create User Fields
  export class CreateUserDto extends OmitType(UserModel, [
    'createdAt',
    'updatedAt',
    'avatarPath',
    'id',
    'isDeleted',
    'followersCount',
    'followersOfCount',
  ]) {}

  //Update User Fields
  export class UpdateUserDto extends OmitType(UserModel, [
    'followersCount',
    'followersOfCount',
    'createdAt',
    'updatedAt',
  ]) {}

  //Create User Response
  export class CreateUserResponse extends OmitType(UserModel, [
    'passwordHash',
    'followers',
    'followersOf',
    'posts',
    'followersCount',
    'followersOfCount',
    'id',
    'createdAt',
    'updatedAt',
    'isDeleted',
    'avatarPath',
  ]) {}

  //Find all users
  export class FindAllUsers {
    @ApiProperty({
      description: 'Пользователи',
      type: ShortUser,
      isArray: true,
    })
    results: () => ShortUser[];

    @ApiProperty({
      description: 'Мета пагинации',
      type: Pagination.PaginationMeta,
    })
    meta: () => Pagination.PaginationMeta;
  }

  //Delete User Response
  export class DeleteUserResponse extends OmitType(UserModel, [
    'passwordHash',
    'followers',
    'followersOf',
    'posts',
    'followersCount',
    'followersOfCount',
  ]) {
    @ApiProperty({
      description: 'Статус удаленного аккаунта',
      example: true,
      type: Boolean,
      default: false,
    })
    isDeleted: boolean;
  }

  //Find User by Id Response
  export class FindUniqueUserResponse extends OmitType(UserModel, [
    'posts',
    'followers',
    'followersOf',
    'passwordHash',
    'email',
  ]) {}

  //Find Me Response
  export class FindMeResponse extends OmitType(UserModel, [
    'passwordHash',
    'posts',
  ]) {}

  //Update User Response
  export class UpdateUserResponse extends OmitType(UserModel, [
    'passwordHash',
    'posts',
    'followers',
    'followersOf',
  ]) {}
}
