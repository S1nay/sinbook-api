import { IsInt } from 'class-validator';

export class CreateFollowDto {
  @IsInt({ message: 'Поле followingUserId должно быть числом' })
  followingUserId: number;
}
