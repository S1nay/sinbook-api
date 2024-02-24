import { OmitType } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class CreateUserResponse extends OmitType(UserEntity, [
  'passwordHash',
  'followers',
  'followersOf',
  'posts',
  'followersCount',
  'followersOfCount',
]) {}

export class DeleteUserResponse extends OmitType(UserEntity, [
  'passwordHash',
  'followers',
  'followersOf',
  'posts',
  'followersCount',
  'followersOfCount',
]) {}

export class FindUniqueUserResponse extends OmitType(UserEntity, [
  'posts',
  'followers',
  'followersOf',
  'passwordHash',
  'email',
]) {}

export class FindMeResponse extends OmitType(UserEntity, [
  'passwordHash',
  'posts',
]) {}

export class FindEmalUserResponse extends OmitType(UserEntity, [
  'posts',
  'followers',
  'followersOf',
  'followersCount',
  'followersOfCount',
]) {}

export class UpdateUserResponse extends OmitType(UserEntity, [
  'passwordHash',
  'posts',
  'followers',
  'followersOf',
]) {}
