import { IsInt } from 'class-validator';

import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {
  @IsInt({ message: 'Поле likes должно быть числом' })
  likes: number;

  @IsInt({ message: 'Поле likes должно быть числом' })
  views: number;
}
