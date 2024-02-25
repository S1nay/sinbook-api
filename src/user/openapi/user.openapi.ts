import { ApiHideProperty, ApiProperty, OmitType } from '@nestjs/swagger';
import { $Enums, Gender, User } from '@prisma/client';

import { CommentOneApi } from '#comment/openapi/comment.openapi';
import { PostOpenApi } from '#post/openapi/post.openapi';

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
    comments?: () => CommentOneApi.CommentModel[];
  }

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

  //Delete User Response
  export class DeleteUserResponse extends OmitType(UserModel, [
    'passwordHash',
    'followers',
    'followersOf',
    'posts',
    'followersCount',
    'followersOfCount',
  ]) {}

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

  //Find User by Email Response
  export class FindEmalUserResponse extends OmitType(UserModel, [
    'posts',
    'followers',
    'followersOf',
    'followersCount',
    'followersOfCount',
  ]) {}

  //Update User Response
  export class UpdateUserResponse extends OmitType(UserModel, [
    'passwordHash',
    'posts',
    'followers',
    'followersOf',
  ]) {}
}
