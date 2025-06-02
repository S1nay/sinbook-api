import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';

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
    followsCount?: number;

    @ApiProperty({
      description: 'Кол-во постов',
      example: 1,
      type: Number,
    })
    postsCount?: number;
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
      description: 'Биография пользователя',
      example: 'Дизайнер, Айтишник',
      type: String,
      required: true,
    })
    biography: string;

    @ApiProperty({
      description: 'Никнейм пользователя',
      example: '@Nickname',
      type: String,
      required: true,
    })
    nickName: string;

    @ApiProperty({
      description: 'Имя пользователя',
      example: 'Тест',
      type: String,
      required: true,
    })
    name: string;

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
      required: false,
    })
    avatarPath: string | null;

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
    'nickName',
    'avatarPath',
  ]) {}

  //Create User Fields
  export class CreateUserDto extends OmitType(UserModel, [
    'createdAt',
    'updatedAt',
    'postsCount',
    'id',
    'isDeleted',
    'followersCount',
    'followsCount',
  ]) {}

  //Update User Fields
  export class UpdateUserDto extends OmitType(UserModel, [
    'postsCount',
    'isDeleted',
    'followersCount',
    'followsCount',
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
    'followsCount',
    'postsCount',
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
    'followsCount',
  ]) {}

  //Find User by Id Response
  export class FindUniqueUserResponse extends OmitType(UserModel, [
    'posts',
    'followers',
    'followersOf',
    'passwordHash',
    'email',
  ]) {}

  //Update User Response
  export class UpdateUserResponse extends OmitType(UserModel, [
    'passwordHash',
    'posts',
    'followers',
    'followersOf',
  ]) {}
}
